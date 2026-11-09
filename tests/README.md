# Runtime verification

Checks use actual files and a running Obsidian instance. There is no mocked Obsidian API.

Install the three plugin files in a test vault and enable Attachment Cards. Fixture generation requires Python packages `python-docx`, `openpyxl`, `Pillow`, `python-pptx` and `reportlab`; these are development-only dependencies, not plugin dependencies.

```sh
python tests/create_fixtures.py "/path/to/test-vault/Attachment Cards Demo"
```

`runtime-check.js` is a function body that accepts `app`, `plugin` and `notePath`. Execute it through Obsidian's developer CLI `eval` command with the host's real `app`, `app.plugins.plugins['attachment-cards']` and the fixture note's vault-relative path. It opens a temporary tab, checks Reading view and Live Preview, verifies six card categories and SVG icons, checks that the image remains native, and detaches the temporary tab in `finally`.

The check leaves an off-screen element with ID `attachment-cards-release-preview`, containing only neutral card examples, for documentation capture. For a screenshot, temporarily position that element at the viewport origin and capture its 480 × 620 px bounds with the CLI's `Page.captureScreenshot` CDP command. Remove the preview element afterward. Remove the generated fixture files after testing; do not include test-vault configuration or user notes in release archives.

The test does not open Office applications or modify existing notes.
