import { mkdir, writeFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Terminal } from "lucide-react";
import { chromium } from "@playwright/test";

// Lucide glyph, with its content inside the maskable icon's safe area.
const glyph = renderToStaticMarkup(
  createElement(Terminal, {
    x: 17,
    y: 17,
    width: 30,
    height: 30,
    color: "#7dcfff",
    strokeWidth: 1.8,
  }),
);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#10131c"/><rect x="11" y="11" width="42" height="42" rx="5" fill="#171c28" stroke="#38445e"/>${glyph}</svg>`;
await mkdir("public/icons", { recursive: true });
await writeFile("public/favicon.svg", svg);
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
  args: ["--no-sandbox"],
});
try {
  for (const [name, size] of [
    ["icon-192", 192],
    ["icon-512", 512],
    ["maskable-512", 512],
    ["apple-touch-icon", 180],
  ]) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<style>body{margin:0}body>svg{display:block;width:100vw;height:100vh}</style>${svg}`,
    );
    await page.screenshot({ path: `public/icons/${name}.png` });
    await page.close();
  }
} finally {
  await browser.close();
}
