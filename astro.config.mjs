// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // ponytail: the CSS minifier fuses `animation` + `animation-timeline` into a
  // shorthand Chrome rejects, which kills every scroll-driven animation. The
  // stylesheet is a few KB; not minifying it is cheaper than working around that.
  vite: { build: { cssMinify: false } },
});
