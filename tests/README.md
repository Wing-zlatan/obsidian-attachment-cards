# Runtime verification

Checks use actual files and a running Obsidian instance. There is no mocked Obsidian API.

Install the three plugin files in a test vault and enable Attachment Cards. Fixture generation requires Python packages `python-docx`, `openpyxl`, `Pillow`, `python-pptx`, `reportlab` and `imageio-ffmpeg`; these are development-only dependencies, not plugin dependencies.

```sh
python tests/create_fixtures.py "/path/to/test-vault/Attachment Cards Demo"
```

Run the real-host checks through the official CLI:

```sh
python scripts/runtime_cli.py --vault "Test Vault" --script tests/runtime-check.js --note "Attachment Cards Demo/Examples.md"
python scripts/runtime_cli.py --vault "Test Vault" --script tests/interaction-check.js --note "Attachment Cards Demo/Examples.md"
```

The scripts use actual `app` and plugin objects, open a temporary tab, and restore the previous tab in `finally`. They inspect the selected view's own DOM, excluding its hidden counterpart. The first checks Reading view, Live Preview, six icon categories and native images. The second checks complete filenames at a 240 px pane width, native audio/video players, selection, real PDF opening with click/Enter/Space, restoration on unload and unchanged Markdown. No host method is replaced.

For the documentation comparison, disable the plugin in the test host, call `capture-comparison.js` with `--phase before --note "Attachment Cards Demo/Writing.md"`, then enable it and call the same script with `--phase after`. It clones the actual rendered note into a two-column presentation without changing the note or drawing substitute cards. Capture with `--screenshot docs/images/attachment-cards-comparison.png`; the launcher briefly places only that neutral presentation in the screenshot region. Finish with `--phase cleanup`.

Remove generated fixture files after testing; do not include test-vault configuration or user notes in release archives. Desktop narrow-pane or dark-theme checks do not establish physical mobile-device support.

The test does not open Office applications or modify existing notes.
