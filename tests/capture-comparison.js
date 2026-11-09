// 将真实宿主渲染的同一篇笔记排成对比图；不模拟插件或重画文件卡片。
return (async () => {
  const stageId = 'attachment-cards-comparison';
  const pause = require('timers/promises').setTimeout;
  if (phase === 'cleanup') {
    document.getElementById(stageId)?.remove();
    return { cleaned: true };
  }
  let stage = document.getElementById(stageId);
  if (!stage) {
    stage = document.createElement('div');
    stage.id = stageId;
    Object.assign(stage.style, {
      position: 'absolute', left: '0', top: '10000px', width: '1200px', height: '800px',
      padding: '32px', boxSizing: 'border-box', background: 'var(--background-primary)',
      color: 'var(--text-normal)', fontFamily: 'var(--font-text)', fontSize: '16px',
      overflow: 'hidden', zIndex: '2147483647',
    });
    stage.style.setProperty('--font-text-size', '16px');
    stage.createEl('h1', { text: 'Files within reach. Notes that flow.' });
    stage.createEl('p', { text: 'The same note and the same embeds. Enable Attachment Cards; keep writing.' });
    const columns = stage.createDiv({ cls: 'attachment-cards-comparison-columns' });
    Object.assign(columns.style, { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' });
    document.body.append(stage);
  }
  const file = app.vault.getAbstractFileByPath(notePath);
  if (!file) throw new Error('Capture fixture is missing.');
  const originalLeaf = app.workspace.activeLeaf;
  const leaf = app.workspace.getLeaf('tab');
  try {
    await leaf.openFile(file, { active: false });
    await leaf.view.setState({ file: file.path, mode: 'preview' }, { history: false });
    await app.workspace.revealLeaf(leaf);
    app.workspace.setActiveLeaf(leaf, { focus: true });
    leaf.view.previewMode.renderer.onRender();
    const deadline = Date.now() + 8000;
    let content;
    while (Date.now() < deadline) {
      content = leaf.view.containerEl.querySelector('.markdown-preview-sizer');
      if (content?.querySelectorAll('.internal-embed').length >= 3 &&
          (phase === 'before' || content.querySelectorAll('.attachment-card').length === 3)) break;
      await pause(50);
    }
    if (!content?.querySelector('h1') || (phase === 'after' && content.querySelectorAll('.attachment-card').length !== 3)) {
      throw new Error('Capture note did not finish rendering.');
    }
    const panel = stage.querySelector('.attachment-cards-comparison-columns').createDiv();
    panel.createEl('h2', { text: phase === 'before' ? 'Before · native attachments' : 'After · Attachment Cards 0.1.2' });
    const rendered = panel.createDiv({ cls: 'markdown-rendered' });
    Object.assign(rendered.style, { border: '1px solid var(--background-modifier-border)', borderRadius: '8px', padding: '18px', height: '570px', overflow: 'hidden', fontSize: '15px', lineHeight: '1.5' });
    const clone = content.cloneNode(true);
    clone.querySelectorAll('.mod-header, .mod-footer, .metadata-container').forEach(element => element.remove());
    clone.removeAttribute('style');
    clone.className = '';
    rendered.append(clone);
    return { phase, cards: clone.querySelectorAll('.attachment-card').length, theme: document.body.classList.contains('theme-dark') ? 'dark' : 'light' };
  } finally {
    leaf.detach();
    if (originalLeaf?.parent) {
      await app.workspace.revealLeaf(originalLeaf);
      app.workspace.setActiveLeaf(originalLeaf, { focus: true });
    }
  }
})();
