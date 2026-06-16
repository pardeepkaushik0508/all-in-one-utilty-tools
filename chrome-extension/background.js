import { DEFAULT_SITE_URL, QUICK_TOOLS, STORAGE_KEYS } from './lib/constants.js';
import { getSettings } from './lib/storage.js';

const MENU_PARENT = 'utilitytools-open-tool';

let menuBuildQueue = Promise.resolve();

async function getSiteUrl() {
  const settings = await getSettings();
  return settings.siteUrl || DEFAULT_SITE_URL;
}

function openTool(slug) {
  getSiteUrl().then((siteUrl) => {
    const url = `${siteUrl.replace(/\/$/, '')}/tool/${slug}`;
    chrome.tabs.create({ url });
  });
}

function createMenuItem(options) {
  return new Promise((resolve) => {
    chrome.contextMenus.create(options, () => {
      // Ignore duplicate-id errors during rapid extension reloads in dev
      if (chrome.runtime.lastError) {
        const msg = chrome.runtime.lastError.message || '';
        if (!msg.includes('duplicate id')) {
          console.warn('contextMenus.create:', msg);
        }
      }
      resolve();
    });
  });
}

function removeAllMenus() {
  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      resolve();
    });
  });
}

function buildContextMenus() {
  menuBuildQueue = menuBuildQueue.then(async () => {
    await removeAllMenus();

    await createMenuItem({
      id: MENU_PARENT,
      title: 'Open with UtilityTools',
      contexts: ['page', 'selection', 'link']
    });

    for (const tool of QUICK_TOOLS) {
      await createMenuItem({
        id: `tool-${tool.slug}`,
        parentId: MENU_PARENT,
        title: tool.name,
        contexts: ['page', 'selection', 'link']
      });
    }

    await createMenuItem({
      id: 'open-home',
      parentId: MENU_PARENT,
      title: 'Browse all tools',
      contexts: ['page', 'selection', 'link']
    });
  });

  return menuBuildQueue;
}

chrome.runtime.onInstalled.addListener((details) => {
  buildContextMenus();

  if (details.reason === 'install') {
    chrome.storage.sync.set({
      [STORAGE_KEYS.siteUrl]: DEFAULT_SITE_URL,
      [STORAGE_KEYS.openInNewTab]: true,
      [STORAGE_KEYS.theme]: 'system',
      [STORAGE_KEYS.favorites]: [],
      [STORAGE_KEYS.recent]: []
    });

    chrome.tabs.create({ url: `${DEFAULT_SITE_URL}/?from=extension` });
  }
});

// Context menus persist across browser sessions — do NOT recreate on every startup.

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'open-home') {
    getSiteUrl().then((siteUrl) => chrome.tabs.create({ url: siteUrl }));
    return;
  }
  if (info.menuItemId.startsWith('tool-')) {
    openTool(info.menuItemId.replace('tool-', ''));
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'OPEN_TOOL' && message.slug) {
    getSettings().then((settings) => {
      const url = `${settings.siteUrl.replace(/\/$/, '')}/tool/${message.slug}`;
      if (settings.openInNewTab) {
        chrome.tabs.create({ url });
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) chrome.tabs.update(tabs[0].id, { url });
          else chrome.tabs.create({ url });
        });
      }
      sendResponse({ ok: true });
    });
    return true;
  }
  return false;
});
