// 由真实 Obsidian CLI 执行；app、plugin、notePath 为调用方传入的宿主对象与示例路径。
return (async () => {
  if (!plugin) throw new Error('Enable Attachment Cards before checking.');
  const file = app.vault.getAbstractFileByPath(notePath);
  if (!file) throw new Error('Create and index the neutral fixture note first.');
  const expected = ['pdf', 'word', 'excel', 'powerpoint', 'text', 'other'];
  const originalLeaf = app.workspace.activeLeaf;
  const leaf = app.workspace.getLeaf('tab');
  const result = {};
  const pause = require('timers/promises').setTimeout;
  const waitForCards = async mode => {
    const deadline = Date.now() + 8000;
    while (true) {
      const container = leaf.view.containerEl.querySelector(mode === 'preview' ? '.markdown-reading-view' : '.markdown-source-view');
      const cards = [...container.querySelectorAll('.attachment-card')];
      if (leaf.view.getMode() === mode && cards.length === 6) {
        const kinds = cards.map(card => card.parentElement.dataset.attachmentKind);
        if (JSON.stringify(kinds) !== JSON.stringify(expected)) throw new Error(`Wrong card categories: ${kinds}`);
        if (cards.some(card => !card.querySelector('svg')?.children.length)) throw new Error('A card icon is missing.');
        if (!container.querySelector('.image-embed:not(.attachment-card-embed) img')) throw new Error('Native image embed was changed.');
        return cards;
      }
      if (Date.now() >= deadline) break;
      await pause(50);
    }
    throw new Error(`Cards did not render in ${mode} mode.`);
  };
  try {
    await leaf.openFile(file, { active: false });
    await leaf.view.setState({ file: file.path, mode: 'preview' }, { history: false });
    await app.workspace.revealLeaf(leaf);
    app.workspace.setActiveLeaf(leaf, { focus: true });
    leaf.view.previewMode.renderer.onRender();
    const readingCards = await waitForCards('preview');
    result.reading = readingCards.map(card => ({ name: card.querySelector('.attachment-card-name').textContent, kind: card.parentElement.dataset.attachmentKind }));
    await leaf.view.setState({ file: file.path, mode: 'source', source: false }, { history: false });
    result.livePreviewCards = (await waitForCards('source')).length;
    result.nativeImage = true;
    result.version = plugin.manifest.version;
    return result;
  } finally {
    leaf.detach();
    if (originalLeaf?.parent) {
      await app.workspace.revealLeaf(originalLeaf);
      app.workspace.setActiveLeaf(originalLeaf, { focus: true });
    }
  }
})();
