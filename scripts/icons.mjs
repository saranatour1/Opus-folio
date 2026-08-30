// Rasterises public/favicon.svg into the PNG sizes that SVG favicons don't cover:
// iOS home screens (apple-touch-icon) and Android/PWA install icons.
//
//   node scripts/icons.mjs
//
// ponytail: same headless Chrome as scripts/og.mjs. No image dependency.
import { readFile, writeFile, mkdtemp, rm, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { tmpdir } from "node:os";

const run = promisify(execFile);
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// size, output, and how much paper shows around the mark
const ICONS = [
  { px: 180, out: "public/apple-touch-icon.png", pad: 14 },
  { px: 192, out: "public/icon-192.png", pad: 14 },
  { px: 512, out: "public/icon-512.png", pad: 14 },
  { px: 32, out: "public/favicon-32.png", pad: 2 },
];

const mark = await readFile("public/favicon.svg", "utf8");
const dir = await mkdtemp(join(tmpdir(), "icons-"));
const profile = await mkdtemp(join(tmpdir(), "icons-chrome-"));

try {
  // Chrome lingers for ~30s after writing the screenshot, so fire them together
  // rather than paying that wait four times over.
  await Promise.all(
    ICONS.map(async ({ px, out, pad }) => {
      const page = join(dir, `${px}.html`);
      await writeFile(
        page,
        `<!doctype html><meta charset="utf-8"><style>
        html, body { margin: 0; width: ${px}px; height: ${px}px; overflow: hidden; }
        body { background: #f3efe5; display: grid; place-items: center; }
        svg { width: ${px - pad * 2}px; height: ${px - pad * 2}px; }
        /* the mark flips to pale ink in dark mode; icons are always rendered light */
        .ink { stroke: #3a332c !important; }
      </style>${mark}`,
      );
      await run(
        CHROME,
        [
          "--headless=new",
          `--user-data-dir=${join(profile, String(px))}`,
          "--hide-scrollbars",
          "--force-color-profile=srgb",
          "--virtual-time-budget=1000",
          `--window-size=${px},${px}`,
          `--screenshot=${out}`,
          `file://${page}`,
        ],
        { timeout: 20_000 },
      ).catch(async (e) => {
        // Chrome writes the file and then hangs; only a missing file is fatal.
        await stat(out).catch(() => {
          throw e;
        });
      });
      console.log(`wrote ${out} (${px}x${px})`);
    }),
  );
} finally {
  await rm(dir, { recursive: true, force: true });
  await rm(profile, { recursive: true, force: true });
}
