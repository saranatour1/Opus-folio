// Renders public/og.png (1200x630) from the built hero, using the real fonts and
// the real ink drawing — the social card is the page's first screen, not a mockup.
//
//   node scripts/og.mjs        (run after `astro build`)
//
// ponytail: node stdlib + the Chrome already on this machine. No renderer dependency.
import { createServer } from "node:http";
import { readFile, writeFile, unlink, mkdtemp, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { extname, join } from "node:path";
import { tmpdir } from "node:os";

const run = promisify(execFile);
const DIST = "dist";
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

const html = await readFile(`${DIST}/index.html`, "utf8");
const grab = (re, what) => {
  const m = html.match(re);
  if (!m) throw new Error(`og: could not find ${what} in ${DIST}/index.html — did the build change?`);
  return m[0];
};

const css = grab(/<link rel="stylesheet" href="[^"]+">/, "the stylesheet link");
const petals = grab(/<div class="petals"[\s\S]*?<\/div>/, "the petals");
const hero = grab(/<header class="hero">[\s\S]*?<\/header>/, "the hero");

await writeFile(
  `${DIST}/og.html`,
  `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8">${css}<style>
    html, body { width: 1200px; height: 630px; overflow: hidden; }
    .hero { min-height: 630px; padding: 0 5.5rem; }
    h1 { font-size: 8.5rem; }
    .lede { font-size: 1.2rem; max-width: 34ch; }
    .scrollhint { display: none; }
    .bough { width: 60rem; inset: auto -4% -10% -14%; }
    /* A still, not a frame of a movie: kill every animation, then set the end
       state by hand. Chrome's --virtual-time-budget never expires while an
       infinite animation is running, so this is also what lets it exit. */
    *, *::before, *::after { animation: none !important; }
    .bough path { stroke-dashoffset: 0; }
    .bough circle { opacity: 0.9; }
    .petals span { top: calc(var(--phase) * 0.115%); opacity: 0.7; }
  </style></head><body>${petals}${hero}</body></html>`,
);

const server = createServer(async (req, res) => {
  const path = join(DIST, decodeURIComponent(req.url.split("?")[0]));
  try {
    const body = await readFile(path);
    res.writeHead(200, { "Content-Type": TYPES[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/og.html`;

const profile = await mkdtemp(join(tmpdir(), "og-chrome-"));
try {
  await run(CHROME, [
    "--headless=new",
    `--user-data-dir=${profile}`,
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    "--virtual-time-budget=4000",
    "--window-size=1200,630",
    "--screenshot=public/og.png",
    url,
  ], { timeout: 60_000 });
} finally {
  server.close();
  await Promise.all([unlink(`${DIST}/og.html`), rm(profile, { recursive: true, force: true })]);
}

console.log("wrote public/og.png — rebuild to copy it into dist/");
