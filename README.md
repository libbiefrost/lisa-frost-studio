# Lisa Frost

A minimal, static artist portfolio. White background, black hairline rules, shuffled artwork and related collections. No framework, service account, paid service or build step.

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Do not open index.html directly: browsers block local JSON requests.

## Files

- `index.html`: page structure
- `style.css`: appearance and responsive layout
- `app.js`: shuffle, detail view, related collections and local curation
- `artwork.json`: titles, source filenames, collections, working tags and derived colors
- `images-0.json`, `images-1.json`: optimized WebP images, stored as data URLs keyed by artwork ID
- `.nojekyll`: static GitHub Pages support

The image bundles keep this initial handoff compact. They can be unpacked into individual files for faster incremental loading. No Dropbox token or account credential is required to serve the site. All paths are relative so this can move to a custom domain later.

## Editing and curation

Edit mode stores removals only in the current browser. Visitors cannot change the published site. Export artwork.json after curating, replace the repository's artwork.json and commit to publish the cull. Originals are never deleted. Existing saved changes are local to that browser.

## Artwork scope

This first pass contains 156 works selected from the supplied Dropbox studio archive. No artwork from the prior Drive/Instagram gallery is used. Studio folder names supply collections. Keyword and color tags are provisional, not artist-verified. Brand files, resumes, fonts, styled-room mockups, repeated views and photos centered on people were excluded. Alternate views and HEIC files remain out of this first pass. Videos are not included yet: they need a separate process-only/no-overlay review before conversion. Text painted as part of an artwork is preserved; added social text overlays are not used.

Only resized web copies are included. Copyright remains with the artist. No open-source license is granted to the artwork.

## Deploy

On GitHub Pages, publish the `main` branch, root folder. Do not add a custom-domain CNAME until the domain owner is ready. No custom domain or DNS has been changed.

## Claude Code handoff

Clone this repository, start the local server and inspect desktop and mobile layouts. Preserve relative URLs, the white-only layout and thin black rules. Keep image IDs stable so curation state continues to work. The next useful improvement is splitting the image bundles into individual WebP files with thumbnails and lazy loading, while retaining the metadata IDs.
