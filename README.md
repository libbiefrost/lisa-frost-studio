# Lisa Frost

A minimal, static artist portfolio. White background, black hairline rules, shuffled artwork and related collections. No framework, service account, paid service or build step.

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Do not open index.html directly: browsers block local JSON requests.

## Files

- `index.html`: page shell and nav
- `style.css`: appearance and responsive layout (one file; change `--typeface` to swap the font)
- `app.js`: hash routing and rendering (`#/`, `#/paintings`, `#/practice`, `#/objects`, `#/work/<id>`, `#/about`, `#/stories`, `#/edit`)
- `artwork.json`: titles, sections, series, source filenames, collections, working tags and derived colors, plus the `home` list of 12 ids
- `content.json`: all site text (home intro, series intros, stories, About). Anything set to `TODO` stays hidden
- `photos/`: 284 optimized WebP artwork files
- `.nojekyll`: static GitHub Pages support

No Dropbox token or account credential is required to serve the site. All paths are relative so this can move to a custom domain later.

## Editing and curation

Open `#/edit` (not linked in the nav) to remove works. Removals are stored only in the current browser. Export artwork.json, replace the repository's artwork.json and commit to publish the cull. Originals are never deleted.

## Artwork scope

This package was synced against the supplied Dropbox archive on November 21, 2026. It contains 284 selected artwork views: the original 156 plus 128 new views. All gallery artwork is Dropbox-sourced. No artwork from the prior Drive/Instagram gallery is used. Collection names come from studio folders. Keyword and color tags are provisional, not artist-verified.

This is a curated gallery, not the full Dropbox. Brand/admin files, styled-room displays, repeated/alternate views and photos centered on people are excluded. HEIC-only files and videos remain outside the gallery. Images of people depicted in artwork are included. New art includes sketches, paintings, ceramics, furniture and children's art. Original embedded text remains part of the artwork.

`source-documents/` contains the two Word artist/brand statements from Dropbox for editing reference. They have not been inserted into the live page or rewritten. `dropbox-inventory.json` inventories all 1,480 current archive files; it does not bundle all original assets. `DROPBOX-SYNC.json` records additions, exclusions and exact-byte renames. Existing image IDs were preserved and renamed source paths were updated.

Only resized web copies are included. Copyright remains with the artist. No open-source license is granted to the artwork.

## Deploy

On GitHub Pages, publish the `main` branch, root folder. Do not add a custom-domain CNAME until the domain owner is ready. No custom domain or DNS has been changed.

## Claude Code handoff

Clone this repository, start the local server and inspect desktop and mobile layouts. Preserve relative URLs, the white-only layout and thin black rules. Keep image IDs stable so curation state continues to work. Artwork files are local and lazily loaded. Keep source filenames and collection tags intact when adding or changing artwork.
