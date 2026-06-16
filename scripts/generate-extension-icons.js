#!/usr/bin/env node
/**
 * Generate PNG icons for the Chrome extension from icons/icon.svg
 * Requires sharp (from backend workspace).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'chrome-extension', 'icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');
const SIZES = [16, 32, 48, 128];

async function main() {
  let sharp;
  try {
    sharp = require(path.join(ROOT, 'node_modules', 'sharp'));
  } catch {
    try {
      sharp = require(path.join(ROOT, 'backend', 'node_modules', 'sharp'));
    } catch {
      console.error('sharp is required. Run: npm install (from repo root)');
      process.exit(1);
    }
  }

  if (!fs.existsSync(SVG_PATH)) {
    console.error('Missing', SVG_PATH);
    process.exit(1);
  }

  const svg = fs.readFileSync(SVG_PATH);
  for (const size of SIZES) {
    const out = path.join(ICONS_DIR, `icon-${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(out);
    console.log('Wrote', out);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
