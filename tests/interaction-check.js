// 在真实 Obsidian 中检查几何、原生媒体与文件打开，不替换宿主方法。
return (async () => {
  if (!plugin) throw new Error('Enable Attachment Cards first.');
  const folder = notePath.slice(0, notePath.lastIndexOf('/'));
  const examples = app.vault.getAbstractFileByPath(notePath);
  const boundary = app.vault.getAbstractFileByPath(`${folder}/Boundaries.md`);
  const originalText = await app.vault.read(examples);
  const boundaryText = await app.vault.read(boundary);
  const originalLeaf = app.workspace.activeLeaf;
  const originalLeaves = new Set(app.workspace.getLeavesOfType('pdf'));
  let leaf;
  const testLeaves = new Set();
  const result = { version: plugin.manifest.version };
  const pause = require('timers/promises').setTimeout;
  const selection = window.getSelection();
  const oldRanges = Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange());
  const waitFor = async (predicate, message) => {
    const deadline = Date.now() + 8000;
    while (true) {
      const value = predicate();
      if (value) return value;
      if (Date.now() >= deadline) break;
      await pause(50);
    }
    throw new Error(typeof message === 'function' ? message() : message);
  };
  const openNote = async (file, mode) => {
    leaf = app.workspace.getLeaf('tab');
    testLeaves.add(leaf);
    const state = mode === 'source' ? { file: file.path, mode, source: false } : { file: file.path, mode };
    await leaf.setViewState({ type: 'markdown', state });
    await app.workspace.revealLeaf(leaf);
    app.workspace.setActiveLeaf(leaf, { focus: true });
    // 后台 Electron 窗口可能暂停动画帧；直接调用宿主原有渲染入口，不替换其实现。
    if (mode === 'preview') {
      leaf.view.previewMode.renderer.onRender();
    }
    return leaf.view.containerEl.querySelector(mode === 'preview' ? '.markdown-reading-view' : '.markdown-source-view');
  };
  try {
    for (const mode of ['preview', 'source']) {
      const root = await openNote(boundary, mode);
      const card = await waitFor(() => root.querySelector('.attachment-card'), () => `Missing long-name card in ${mode}: ${JSON.stringify({active:app.workspace.activeLeaf===leaf,connected:root.isConnected,width:root.clientWidth,text:root.textContent.slice(0,200)})}`);
      await waitFor(() => root.querySelector('audio'), `Missing native audio in ${mode}`);
      await waitFor(() => root.querySelector('video'), `Missing native video in ${mode}`);
      if (root.querySelector('audio')?.closest('.attachment-card-embed') || root.querySelector('video')?.closest('.attachment-card-embed')) throw new Error('Media player was converted into a card.');
      const name = card.querySelector('.attachment-card-name');
      if (!name.textContent.endsWith('revision 2026-11-09 final.docx')) throw new Error('Filename suffix is missing.');
      const view = leaf.view.containerEl;
      const oldWidth = view.style.width;
      try {
        view.style.width = '240px';
        const rect = card.getBoundingClientRect();
        if (rect.width > 240 || rect.width < 80) throw new Error(`Narrow card overflow: ${rect.width}`);
        if (name.scrollHeight > name.clientHeight + 1 || name.scrollWidth > name.clientWidth + 1) throw new Error('Long filename is clipped.');
        if (parseFloat(getComputedStyle(card).fontSize) < 14) throw new Error('Theme reduced the card text below 14 px.');
        result[mode] = { narrowWidth: rect.width, longNameHeight: rect.height, fontSize: getComputedStyle(card).fontSize, audio: true, video: true };
      } finally {
        view.style.width = oldWidth;
      }
    }
    let root = await openNote(examples, 'preview');
    const pdfCard = await waitFor(() => root.querySelector('[data-attachment-kind="pdf"] .attachment-card'), () => `Missing PDF card: ${JSON.stringify({connected:root.isConnected,width:root.clientWidth,file:leaf.view.file?.path,mode:leaf.view.getMode(),text:root.textContent.slice(0,300),cards:[...root.querySelectorAll('.attachment-card')].map(card=>card.textContent)})}`);
    result.shortCardHeight = pdfCard.getBoundingClientRect().height;
    if (result.shortCardHeight < 44 || result.shortCardHeight > 60) throw new Error('Short card is not compact.');
    const range = document.createRange();
    range.selectNodeContents(pdfCard.querySelector('.attachment-card-name'));
    selection.removeAllRanges();
    selection.addRange(range);
    pdfCard.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
    await Promise.resolve();
    if (app.workspace.getLeavesOfType('pdf').some(item => !originalLeaves.has(item))) throw new Error('Selecting text opened the attachment.');
    result.selectionPreserved = selection.toString() === 'Report.pdf';
    if (!result.selectionPreserved) throw new Error('Text selection was lost.');
    selection.removeAllRanges();

    for (const action of ['click', 'Enter', ' ']) {
      root = await openNote(examples, 'preview');
      const currentCard = await waitFor(() => root.querySelector('[data-attachment-kind="pdf"] .attachment-card'), 'PDF card did not return after closing the file.');
      currentCard.focus();
      const event = action === 'click'
        ? new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })
        : new KeyboardEvent('keydown', { key: action, bubbles: true, cancelable: true });
      const existingPdfLeaves = new Set(app.workspace.getLeavesOfType('pdf'));
      currentCard.dispatchEvent(event);
      const opened = await waitFor(() => app.workspace.getLeavesOfType('pdf').find(item => !existingPdfLeaves.has(item) && item.view.file?.path === `${folder}/Report.pdf`), `PDF did not open using ${action}`);
      testLeaves.add(opened);
    }
    result.openMethods = ['click', 'Enter', 'Space'];
    root = await openNote(examples, 'preview');
    await app.plugins.disablePlugin('attachment-cards');
    if (root.querySelector('.attachment-card, .attachment-card-embed')) throw new Error('Cards remain after unload.');
    await app.plugins.enablePlugin('attachment-cards');
    root = await openNote(examples, 'preview');
    await waitFor(() => root.querySelector('.attachment-card'), 'Cards did not return after enabling.');
    result.unloadRestore = true;
    if (originalText !== await app.vault.read(examples) || boundaryText !== await app.vault.read(boundary)) throw new Error('Fixture Markdown changed.');
    result.noteTextUnchanged = true;
    return result;
  } finally {
    if (!app.plugins.plugins['attachment-cards']) await app.plugins.enablePlugin('attachment-cards');
    for (const item of app.workspace.getLeavesOfType('pdf')) if (!originalLeaves.has(item) && item.view.file?.path.startsWith(folder + '/')) item.detach();
    selection.removeAllRanges();
    for (const item of testLeaves) if (item.parent) item.detach();
    if (originalLeaf?.parent) {
      await app.workspace.revealLeaf(originalLeaf);
      app.workspace.setActiveLeaf(originalLeaf, { focus: true });
    }
    for (const range of oldRanges) if (range.startContainer.isConnected) selection.addRange(range);
  }
})();
