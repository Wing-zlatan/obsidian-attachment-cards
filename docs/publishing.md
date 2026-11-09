# Publishing Attachment Cards

## GitHub repository

Repository: [wing-zlatan/obsidian-attachment-cards](https://github.com/Wing-zlatan/obsidian-attachment-cards).

Description:

> Recognizable attachment cards for readable notes. Keep existing embeds, complete filenames and native media.

Push validated commits to the existing repository:

```sh
git push origin main
```

## Release 0.1.2

Run from a clean, committed repository:

```sh
node --check main.js
python scripts/package_release.py
```

Create a GitHub Release with tag **`0.1.2`**, targeting the committed `main` branch. The tag must match `manifest.json` exactly, without a `v` prefix. Keep previous release tags and assets intact.

Upload these files from `dist/0.1.2/` individually:

- `main.js`
- `manifest.json`
- `styles.css`

The packaging script also creates installation and source ZIPs for local delivery. Only the three files above are uploaded as release assets; GitHub provides source archives automatically, and Obsidian does not use additional ZIP assets.

Release title: **Attachment Cards 0.1.2**

Suggested release body:

> More compact attachment cards with complete filenames. Keep dates, revision labels and extensions visible while writing. Native audio and video players remain available alongside images and embedded notes.
>
> Install or update Attachment Cards through Obsidian's Community plugins settings. Existing Markdown stays unchanged. See the README for the before/after example and manual installation.

## Obsidian Community directory

The existing entry is [Attachment Cards](https://community.obsidian.md/plugins/attachment-cards). A new version does not need a new entry.

After the GitHub release is available:

1. Open the existing plugin's management page and select **Check for new releases**.
2. Confirm the new version and inspect its automated review results.
3. Update the listing description and screenshots when the release changes its presentation.

Keep `manifest.json` on the repository's default branch accurate. The plugin ID remains `attachment-cards`.

The manifest currently permits mobile installation, but runtime verification has only covered Windows. Avoid claiming verified mobile support in the listing.

See the official [plugin submission guide](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin) and [account setup guide](https://docs.obsidian.md/community-directory/set-up-and-claim).
