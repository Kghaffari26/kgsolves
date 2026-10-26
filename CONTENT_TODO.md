# Content TODO (client)

Every unknown fact on the site is a `TODO(client): ...` marker in code or content and is listed here.
Nothing on this list has been guessed. Search the codebase for `TODO(client)` to find each one in place.

While `NEXT_PUBLIC_HIDE_TODOS` is not `true`, the site shows visible dashed placeholder markers so
reviewers can see what is missing. Set it to `true` once this list is cleared.

## Company facts

- [ ] **Years in business.** The current site says 15, 30+ and 35 in different places. `TODO(client): confirm years`

## Photos

- [ ] **Legacy photos not yet pulled.** The build sandbox can't reach jmkelleyinc.com. Run
      `npm run scrape`, review `assets/legacy/manifest.json`, then `npm run legacy:apply`.
      Until then every project image is a generated "Photo pending" placeholder.
- [ ] Review generated alt text after `legacy:apply`. `TODO(client): review alt text`
