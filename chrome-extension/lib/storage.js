import { DEFAULT_SITE_URL, STORAGE_KEYS } from './constants.js';

function getSync(keys) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(keys, resolve);
  });
}

function setSync(data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, resolve);
  });
}

export async function getSettings() {
  const data = await getSync([
    STORAGE_KEYS.siteUrl,
    STORAGE_KEYS.theme,
    STORAGE_KEYS.openInNewTab
  ]);
  return {
    siteUrl: (data[STORAGE_KEYS.siteUrl] || DEFAULT_SITE_URL).replace(/\/$/, ''),
    theme: data[STORAGE_KEYS.theme] || 'system',
    openInNewTab: data[STORAGE_KEYS.openInNewTab] !== false
  };
}

export async function getFavorites() {
  const data = await getSync(STORAGE_KEYS.favorites);
  return Array.isArray(data[STORAGE_KEYS.favorites]) ? data[STORAGE_KEYS.favorites] : [];
}

export async function toggleFavorite(slug) {
  const favorites = await getFavorites();
  const next = favorites.includes(slug)
    ? favorites.filter((s) => s !== slug)
    : [slug, ...favorites].slice(0, 30);
  await setSync({ [STORAGE_KEYS.favorites]: next });
  return next;
}

export async function getRecent() {
  const data = await getSync(STORAGE_KEYS.recent);
  return Array.isArray(data[STORAGE_KEYS.recent]) ? data[STORAGE_KEYS.recent] : [];
}

export async function pushRecent(slug) {
  const recent = await getRecent();
  const next = [slug, ...recent.filter((s) => s !== slug)].slice(0, 12);
  await setSync({ [STORAGE_KEYS.recent]: next });
  return next;
}
