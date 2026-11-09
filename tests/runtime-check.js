// 由真实 Obsidian CLI 执行；app、plugin、notePath 为调用方传入的宿主对象与示例路径。
return (async () => {
  if (!plugin) throw new Error('Enable Attachment Cards before checking.');
  const file = app.vault.getAbstractFileByPath(notePath);
  if (!file) throw new Error('Create and index the neutral fixture note first.');
  const expected = ['pdf', 'word', 'excel', 'powerpoint', 'text', 'other'];
  const leaf = app.workspace.getLeaf('tab');
  const result = {};
  const waitForCards = async mode => {
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      const container = leaf.view.containerEl;
      const cards = [...container.querySelectorAll('.attachment-card')];
      if (leaf.view.getMode() === mode && cards.length === 6) {
        const kinds = cards.map(card => card.parentElement.dataset.attachmentKind);
        if (JSON.stringify(kinds) !== JSON.stringify(expected)) throw new Error(`Wrong card categories: ${kinds}`);
        if (cards.some(card => !card.querySelector('svg')?.children.length)) throw new Error('A card icon is missing.');
        if (!container.querySelector('.image-embed:not(.attachment-card-embed) img')) throw new Error('Native image embed was changed.');
        return cards;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error(`Cards did not render in ${mode} mode.`);
  };
  try {
    await leaf.openFile(file, { active: false });
    await leaf.view.setState({ file: file.path, mode: 'preview' }, { history: false });
    const readingCards = await waitForCards('preview');
    result.reading = readingCards.map(card => ({ name: card.querySelector('.attachment-card-name').textContent, kind: card.parentElement.dataset.attachmentKind }));
    const preview = document.createElement('div');
    preview.id = 'attachment-cards-release-preview';
    preview.className = 'markdown-rendered';
    Object.assign(preview.style, { position: 'fixed', top: '10000px', left: '0', width: '480px', height: '620px', boxSizing: 'border-box', padding: '24px', background: 'var(--background-primary)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: 'var(--font-text-size)', zIndex: '2147483647' });
    for (const card of readingCards) preview.append(card.parentElement.cloneNode(true));
    document.body.append(preview);
    await leaf.view.setState({ file: file.path, mode: 'source', source: false }, { history: false });
    result.livePreviewCards = (await waitForCards('source')).length;
    result.nativeImage = true;
    result.version = plugin.manifest.version;
    return result;
  } finally {
    leaf.detach();
  }
})();
