/* Renders icons/icon.svg to the PNG sizes the manifest asks for.
   Run with `npm run icons` after editing the SVG. */
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";

// the source carries a fixed pixel size; let it fill whatever box it is given
const svg = (await readFile("icons/icon.svg", "utf8"))
  .replace(/width="512" height="512"/, 'width="100%" height="100%"');
// CHROMIUM_PATH lets a preinstalled browser be used instead of a download
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

// maskable icons are cropped to a circle by Android, so the art needs a margin
const SIZES = [
  { file: "icons/icon-192.png", size: 192, pad: 0 },
  { file: "icons/icon-512.png", size: 512, pad: 0 },
  { file: "icons/icon-maskable-512.png", size: 512, pad: 0.14 },
  { file: "icons/apple-touch-icon.png", size: 180, pad: 0.08 },
];

for (const { file, size, pad } of SIZES) {
  const inner = Math.round(size * (1 - pad * 2));
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<body style="margin:0;background:#16272c;display:grid;place-items:center;width:${size}px;height:${size}px">
       <div style="width:${inner}px;height:${inner}px">${svg}</div></body>`);
  await writeFile(file, await page.screenshot({ omitBackground: false }));
  await page.close();
  console.log(file, `${size}x${size}`);
}
await browser.close();
