# Legacy assets

Output of `npm run scrape` (images, page text and `manifest.json`). Image binaries are
gitignored; the manifest and `.txt` files are committed.

**Status:** not yet scraped. The build sandbox could not reach jmkelleyinc.com or
img1.wsimg.com (blocked by its network policy). Run `npm run scrape` from any machine with
normal internet access, review the `finished`/`jobsite` grouping in `manifest.json`, then run
`npm run legacy:apply` to replace the generated placeholders in `/public/images/projects`.
