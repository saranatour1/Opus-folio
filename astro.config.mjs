// @ts-check
import { defineConfig, envField } from 'astro/config';

// `site` is needed before astro:env exists, so read .env here.
// ponytail: node 22 stdlib, no dotenv, no vite import.
try {
  process.loadEnvFile();
} catch {
  // no .env — the schema defaults below apply (see .env.example)
}

// https://astro.build/config
export default defineConfig({
  // canonical, og:url, sitemap and robots.txt are all built off this
  site: process.env.PUBLIC_SITE_URL || 'https://opus.example',

  // https://docs.astro.build/en/guides/environment-variables/
  env: {
    schema: {
      PUBLIC_SITE_URL: envField.string({
        context: 'client',
        access: 'public',
        default: 'https://opus.example',
      }),
      PUBLIC_CONTACT_EMAIL: envField.string({
        context: 'client',
        access: 'public',
        default: 'hello@example.com',
      }),
      PUBLIC_X_HANDLE: envField.string({ context: 'client', access: 'public', optional: true }),
      // optional CDN for the social card, e.g. https://ik.imagekit.io/your_id
      PUBLIC_IMAGEKIT_URL_ENDPOINT: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
  },

  // ponytail: the CSS minifier fuses `animation` + `animation-timeline` into a
  // shorthand Chrome rejects, which kills every scroll-driven animation. The
  // stylesheet is a few KB; not minifying it is cheaper than working around that.
  vite: { build: { cssMinify: false } },
});
