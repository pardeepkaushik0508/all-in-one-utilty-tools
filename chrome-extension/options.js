import { DEFAULT_SITE_URL, STORAGE_KEYS } from './lib/constants.js';

const form = document.getElementById('settings-form');
const siteUrlInput = document.getElementById('site-url');
const themeSelect = document.getElementById('theme');
const openNewTabInput = document.getElementById('open-new-tab');
const savedMsg = document.getElementById('saved-msg');

chrome.storage.sync.get(
  [STORAGE_KEYS.siteUrl, STORAGE_KEYS.theme, STORAGE_KEYS.openInNewTab],
  (data) => {
    siteUrlInput.value = data[STORAGE_KEYS.siteUrl] || DEFAULT_SITE_URL;
    themeSelect.value = data[STORAGE_KEYS.theme] || 'system';
    openNewTabInput.checked = data[STORAGE_KEYS.openInNewTab] !== false;
  }
);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const siteUrl = siteUrlInput.value.trim().replace(/\/$/, '');
  chrome.storage.sync.set({
    [STORAGE_KEYS.siteUrl]: siteUrl || DEFAULT_SITE_URL,
    [STORAGE_KEYS.theme]: themeSelect.value,
    [STORAGE_KEYS.openInNewTab]: openNewTabInput.checked
  }, () => {
    savedMsg.classList.remove('hidden');
    setTimeout(() => savedMsg.classList.add('hidden'), 2000);
  });
});
