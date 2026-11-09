const { Plugin, TFile, Notice, setIcon, parseLinktext } = require('obsidian');

// 图片与笔记保留原生内容视图，其余附件统一使用文件卡片。
const NATIVE_EXTENSIONS = new Set([
  'md', 'canvas', 'base', 'excalidraw',
  'avif', 'bmp', 'gif', 'heic', 'heif', 'ico', 'jpeg', 'jpg', 'png', 'svg', 'tif', 'tiff', 'webp',
]);

function fileKind(extension) {
  if (extension === 'pdf') return { kind: 'pdf', label: 'PDF', icon: 'file-text' };
  if (['doc', 'docx', 'docs'].includes(extension)) return { kind: 'word', label: 'W', icon: 'file-text' };
  if (['xls', 'xlsx'].includes(extension)) return { kind: 'excel', label: 'X', icon: 'sheet' };
  if (['ppt', 'pptx'].includes(extension)) return { kind: 'powerpoint', label: 'P', icon: 'presentation' };
  if (extension === 'txt') return { kind: 'text', label: 'TXT', icon: 'file-text' };
  return { kind: 'other', label: '', icon: 'file' };
}

module.exports = class AttachmentCards extends Plugin {
  onload() {
    this.running = true;
    this.roots = new Map();
    this.sources = new WeakMap();
    this.targets = new WeakMap();
    this.registerMarkdownPostProcessor((element, context) => {
      this.scan(element, context.sourcePath, true);
    });
    this.registerEvent(this.app.workspace.on('layout-change', () => this.syncRoots()));
    this.registerEvent(this.app.workspace.on('file-open', () => this.syncRoots()));
    this.registerEvent(this.app.metadataCache.on('resolved', () => this.refresh()));
    this.app.workspace.onLayoutReady(() => {
      if (this.running) this.syncRoots();
    });
    this.register(() => {
      this.running = false;
      for (const [root, binding] of this.roots) {
        binding.observer.disconnect();
        this.restore(root);
      }
      this.roots.clear();
    });
  }

  syncRoots() {
    const views = this.app.workspace.getLeavesOfType('markdown').map(leaf => leaf.view);
    const current = new Set(views.map(view => view.containerEl));
    for (const [root, binding] of this.roots) {
      if (!current.has(root)) {
        binding.observer.disconnect();
        this.restore(root);
        this.roots.delete(root);
      }
    }
    for (const view of views) {
      const root = view.containerEl;
      if (!this.roots.has(root)) {
        const observer = new root.ownerDocument.defaultView.MutationObserver(records => {
          const pending = new Set();
          for (const record of records) {
            if (record.type === 'attributes') pending.add(record.target);
            for (const node of record.addedNodes) {
              if (node.nodeType === 1 && !node.closest('.attachment-card')) pending.add(node);
            }
            // 原生渲染器可能重新创建嵌入内容，此时只补回丢失的卡片。
            const embed = record.target.closest?.('.internal-embed');
            if (embed?.classList.contains('attachment-card-embed') && !embed.querySelector(':scope > .attachment-card')) {
              pending.add(embed);
            }
          }
          for (const element of pending) this.scan(element, view.file?.path || '');
        });
        observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'alt'] });
        this.roots.set(root, { observer, view });
      }
      this.scan(root, view.file?.path || '');
    }
  }

  refresh() {
    for (const [root, { view }] of this.roots) this.scan(root, view.file?.path || '');
  }

  scan(element, sourcePath, rememberSource = false) {
    if (!this.running || element.closest?.('.attachment-card')) return;
    const embeds = [...element.querySelectorAll('.internal-embed[src]')];
    if (element.matches?.('.internal-embed[src]')) embeds.unshift(element);
    for (const embed of embeds) {
      // 转引笔记的附件应相对其原笔记解析；实时预览则使用当前视图路径。
      if (rememberSource) this.sources.set(embed, sourcePath);
      this.decorate(embed, sourcePath);
    }
  }

  decorate(embed, sourcePath) {
    const link = embed.getAttribute('src');
    if (!link) return;
    const source = this.sources.get(embed) || sourcePath;
    const { path } = parseLinktext(link);
    const file = this.app.metadataCache.getFirstLinkpathDest(path, source);
    if (!(file instanceof TFile) || NATIVE_EXTENSIONS.has(file.extension.toLowerCase())) {
      this.restoreEmbed(embed);
      return;
    }
    const extension = file.extension.toLowerCase();
    const existing = embed.querySelector(':scope > .attachment-card');
    const old = this.targets.get(embed);
    if (existing && old?.link === link && old?.path === file.path && old?.source === source) return;
    this.restoreEmbed(embed);
    this.targets.set(embed, { link, path: file.path, source });
    const { kind, label, icon } = fileKind(extension);
    const card = embed.ownerDocument.createElement('span');
    card.className = 'attachment-card';
    card.setAttribute('role', 'link');
    card.tabIndex = 0;
    card.setAttribute('aria-label', `打开 ${file.name}`);
    card.title = file.name;
    const badge = card.createSpan({ cls: 'attachment-card-icon' });
    badge.setAttribute('aria-hidden', 'true');
    setIcon(badge.createSpan({ cls: 'attachment-card-symbol' }), icon);
    if (label) badge.createSpan({ cls: 'attachment-card-type', text: label });
    card.createSpan({ cls: 'attachment-card-name', text: file.name });
    embed.dataset.attachmentKind = kind;
    embed.classList.add('attachment-card-embed');
    embed.appendChild(card);
    // 只在卡片内部接管打开事件，卡片以外的行内空白保持编辑器行为。
    card.addEventListener('mousedown', event => {
      if (event.button === 0) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
    const open = event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      void this.app.workspace.openLinkText(link, source, event.ctrlKey || event.metaKey)
        .catch(error => {
          console.error('Attachment Cards: 打开附件失败', error);
          new Notice(`无法打开附件：${file.name}`);
        });
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') open(event);
    });
  }

  restoreEmbed(embed) {
    embed.querySelector(':scope > .attachment-card')?.remove();
    embed.classList.remove('attachment-card-embed');
    delete embed.dataset.attachmentKind;
    this.targets.delete(embed);
  }

  restore(root) {
    for (const embed of root.querySelectorAll('.attachment-card-embed')) this.restoreEmbed(embed);
  }
};
