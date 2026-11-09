# Attachment Cards

Compact, clickable attachment cards for Obsidian. Keep your existing embeds and make attached files easier to spot.

[中文说明](README.zh-CN.md)

![Six attachment card types with neutral example filenames](docs/images/attachment-cards.png)

## Features

- File-type icons for PDF, Word, Excel, PowerPoint and plain text, plus a generic icon for other attachments.
- Click a card to open the file using Obsidian's normal link handling.
- Works in Reading view and Live Preview. Source mode keeps the original Markdown.
- Images and embedded notes keep their native display.
- File name only: no file sizes, preview controls or settings to configure.
- No network requests, telemetry or changes to note contents.

| Type | Extensions | Icon color |
| --- | --- | --- |
| PDF | `.pdf` | Red |
| Word | `.doc`, `.docx`, `.docs` | Blue |
| Excel | `.xls`, `.xlsx` | Green |
| PowerPoint | `.ppt`, `.pptx` | Orange |
| Plain text | `.txt` | Slate blue |
| Other attachments | Other non-image, non-note files | Gray |

## Install from a GitHub release

1. Download `main.js`, `manifest.json` and `styles.css` from this repository's **Releases** page.
2. Create an `attachment-cards` folder inside your vault's `.obsidian/plugins/` folder.
3. Place the three files directly inside that folder.
4. Reload Obsidian, then enable **Attachment Cards** under **Settings → Community plugins**.

Alternatively, extract `attachment-cards-0.1.1.zip` into `.obsidian/plugins/`; the ZIP already contains the `attachment-cards/` folder. The release files are ready to run and require no build step.

## Usage

Use ordinary embeds that point to files in your vault:

```markdown
![[Report.pdf]]
![[Document.docx]]
![[Workbook.xlsx]]
![[Slides.pptx]]
![[Notes.txt]]
![[Archive.zip]]
```

Markdown embeds such as `![Report](Report.pdf)` also work. Ordinary links such as `[[Report.pdf]]` stay unchanged. Long names are limited to two visible lines; hover for the complete name. Cards can also be opened with Enter or Space when focused.

PDFs open through Obsidian; Office files use the system's associated application. Disabling the plugin restores native embeds without rewriting your notes.

## Compatibility

The manifest declares Obsidian 1.5.0 or later. Runtime checks were performed on Windows with Obsidian 1.15.0 and the Blue Topaz theme. Older versions and mobile devices have not been verified. The plugin decorates native embed elements, so future changes to Obsidian's embed markup may require an update.

## Development and packaging

`main.js` is both the source and the runtime entry point. `styles.css` contains the scoped card styles. There are no npm dependencies or compilation steps.

```sh
node --check main.js
python scripts/package_release.py
```

Packaging requires Python 3.10+, Node.js and Git. It verifies the version metadata, creates an install ZIP and standalone release assets under `dist/0.1.1/`, and exports the committed source with `git archive`. Commit the finished changes before packaging; the script refuses a dirty repository.

See [publishing instructions](docs/publishing.md) and [runtime verification](tests/README.md).

## License

[MIT](LICENSE). File icons are provided by Obsidian's built-in Lucide icon API; no icon assets are bundled.
