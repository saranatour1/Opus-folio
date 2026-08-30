# opus folio

A personal site, drawn rather than decorated. Every branch, blossom, terrace
and thread on the page is SVG generated at build time from one seeded random;
every animation is native CSS scroll-driven motion.

**The page ships zero JavaScript.**

## Run it

```bash
pnpm install
cp .env.example .env   # then fill it in
pnpm dev
```

`pnpm build` writes `dist/`. `pnpm preview` serves it.

## Environment

Validated by the `env.schema` in [`astro.config.mjs`](astro.config.mjs), so a
missing or malformed value fails the build rather than shipping a broken tag.

| Variable | Used for |
| --- | --- |
| `PUBLIC_SITE_URL` | canonical, `og:url`, `sitemap.xml`, `robots.txt` |
| `PUBLIC_CONTACT_EMAIL` | the address in the footer and in the JSON-LD |
| `PUBLIC_X_HANDLE` | optional; omitted from the markup when blank |

## Layout

```
src/
  lib/ink.ts         every drawing, from one seeded PRNG
  data/content.ts    every word
  components/        Head, Hero, Beat, Cards, Lines, Tree, Petals, Spine, Contact
  pages/
    index.astro      assembly only
    robots.txt.ts    generated from PUBLIC_SITE_URL
    sitemap.xml.ts
    llms.txt.ts      the site in markdown, for models reading it directly
  styles/            tokens · base · ink · layout · motion · fonts
scripts/
  og.mjs             renders public/og.png from the site's own hero
  icons.mjs          rasterises public/favicon.svg into the PNG icon sizes
```

### The drawings

`lib/ink.ts` runs a small seeded PRNG and returns path data: recursive branches
with blossoms at the tips, a 460-stroke terrace band, a meandering squiggle,
and the petal scatter. Same seed, same art, every build — nothing random
reaches the browser, only the path strings.

Call order in `drawing()` is load-bearing. Inserting a new shape between two
existing ones shifts every later draw from the shared stream, and the art
changes. Add at the end.

### The motion

| Effect | Mechanism |
| --- | --- |
| Squiggle draws down the page | `animation-timeline: scroll(root)`, staying slightly ahead of the reader |
| Trees and terrace field grow in | named `view-timeline` on the section |
| Petals sway as you scroll | registered `--wave` property read through `sin()` |
| Ground warms toward dusk | `background-color` animated on `scroll(root)` |
| Beats | `100svh` each, `scroll-snap-stop: always` |

All of it is switched off under `prefers-reduced-motion`.

## Regenerating images

Both are committed, and neither regenerates in CI:

```bash
pnpm og                 # after changing the hero
node scripts/icons.mjs  # after changing public/favicon.svg
```

They render the real page in headless Chrome (`CHROME_PATH` overrides the
binary), so the social card is the site's own first screen rather than a
mockup, in the real fonts.

## Three things that look like mistakes

1. **CSS minification is disabled** (`vite.build.cssMinify: false`). The
   minifier fuses `animation` with `animation-timeline` into a shorthand
   Chrome rejects, silently killing every scroll-driven animation — and the
   page still *looks* fine, because un-animated elements default to visible.
2. **`view()` is avoided on SVG children.** It doesn't resolve on inner SVG
   nodes, so those animate against a named timeline declared on the ancestor.
3. **Beats are pinned to `100svh`.** A snap target taller than the scrollport
   makes the browser relax snapping, which reads as "snapping is broken".

## Type

Source Serif 4 Variable and IBM Plex Mono, self-hosted via Fontsource, latin
subsets only, with the two above-the-fold faces preloaded.
