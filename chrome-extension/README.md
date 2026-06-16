# UtilityTools Chrome Extension

Quick launcher for **200+ free online tools** at [utilitytools.in](https://utilitytools.in).

## Features

- Search and browse the full tool catalog (PDF, image, video, AI, developer, security, utility)
- Category filters and favorites
- Recent tools history
- Right-click context menu: **Open with UtilityTools**
- Light / dark theme (matches system by default)
- Configurable site URL (for staging or self-hosted deployments)

## Install (developer mode)

1. Build metadata and icons from the repo root:

```bash
npm run extension:build
```

2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the `chrome-extension/` folder

## Update tool list

Whenever tools are added or renamed on the website:

```bash
npm run extract:extension-tools
```

Then reload the extension in `chrome://extensions`.

## Project structure

```
chrome-extension/
├── manifest.json       # MV3 manifest
├── popup.html/css/js   # Extension popup UI
├── background.js       # Service worker (context menus)
├── options.html/js     # Settings page
├── tools.json          # Generated tool catalog (205 tools)
├── icons/              # Extension icons
└── lib/                # Shared modules
```

## Settings

Right-click the extension icon → **Options**, or open from the popup footer.

- **Website URL** — defaults to `https://utilitytools.in`
- **Theme** — system, light, or dark
- **Open in new tab** — whether clicking a tool opens a new tab

## Publish to Chrome Web Store

1. Zip the `chrome-extension/` folder (include `tools.json` and icons)
2. Create a developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Upload the zip and complete the listing

## Development notes

- Tool metadata is extracted from `frontend/utils/tools.js` and suite config files via `scripts/extract-tools-metadata.js`
- The extension opens tools on the website — processing runs server-side, not in the extension
- No special permissions beyond `storage` and `contextMenus`
