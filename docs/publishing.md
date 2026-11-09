# Publishing Attachment Cards

## GitHub repository

Use `obsidian-attachment-cards` as the repository name. Suggested description:

> Compact, clickable attachment cards for Obsidian, with file-type icons and native image display.

Create an empty public GitHub repository, then set its URL as `origin` and push the local `main` branch. Use the URL shown by GitHub for your account; do not initialize a second README or license remotely.

```sh
git remote add origin <your-github-repository-url>
git push -u origin main
```

## Release 0.1.1

Run from a clean, committed repository:

```sh
node --check main.js
python scripts/package_release.py
```

Create a GitHub Release with tag **`0.1.1`**, targeting the committed `main` branch. The tag must match `manifest.json` exactly, without a `v` prefix.

Upload these files from `dist/0.1.1/` individually:

- `main.js`
- `manifest.json`
- `styles.css`

Also upload `attachment-cards-0.1.1.zip` for manual installation. `obsidian-attachment-cards-0.1.1-source.zip` is an optional source snapshot; it does not replace the separate install assets.

Suggested release title: **Attachment Cards 0.1.1**

Suggested release body:

> Compact attachment cards with file-type icons for PDF, Word, Excel, PowerPoint, plain text and other attachments. Click to open; images keep their native display. Works with existing embeds in Reading view and Live Preview.
>
> This release adds PowerPoint and plain-text icons. For manual installation, extract the install ZIP into your vault's `.obsidian/plugins/` directory and enable Attachment Cards. See the README for details.

## Obsidian Community directory

Publishing a GitHub repository or release does not automatically list the plugin in Obsidian.

After the public repository and release are available:

1. Sign in to [Obsidian Community](https://community.obsidian.md) with an Obsidian account and connect the GitHub account that owns the repository.
2. Select **New plugin**, enter the public repository URL and submit the entry.
3. Resolve the directory's review feedback before publishing the listing.

Keep `manifest.json` on the repository's default branch accurate. The plugin ID must remain `attachment-cards` and must be unique in the directory; recheck availability before the initial submission.

The manifest currently permits mobile installation, but runtime verification has only covered Windows. Avoid claiming verified mobile support in the listing.

See the official [plugin submission guide](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin) and [account setup guide](https://docs.obsidian.md/community-directory/set-up-and-claim).
