import { CATEGORY_META, STORAGE_KEYS } from './lib/constants.js';
import { getSettings, getFavorites, getRecent, toggleFavorite, pushRecent } from './lib/storage.js';
import { loadTools, buildToolUrl, filterTools, getCategories } from './lib/tools.js';

const els = {
  search: document.getElementById('search'),
  toolList: document.getElementById('tool-list'),
  categories: document.getElementById('categories'),
  empty: document.getElementById('empty-state'),
  toolCount: document.getElementById('tool-count'),
  openSite: document.getElementById('open-site'),
  footerSite: document.getElementById('footer-site'),
  themeToggle: document.getElementById('theme-toggle'),
  optionsBtn: document.getElementById('options-btn'),
  viewTabs: document.getElementById('view-tabs')
};

const state = {
  tools: [],
  favorites: [],
  recent: [],
  settings: null,
  view: 'all',
  category: '',
  query: ''
};

function applyTheme(theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

async function openTool(slug) {
  await pushRecent(slug);
  state.recent = await getRecent();
  chrome.runtime.sendMessage({ type: 'OPEN_TOOL', slug });
  window.close();
}

function renderToolItem(tool) {
  const meta = CATEGORY_META[tool.category] || { color: '#6d28d9' };
  const isFav = state.favorites.includes(tool.slug);
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'tool-item';
  item.setAttribute('role', 'listitem');
  item.innerHTML = `
    <span class="tool-dot" style="background:${meta.color}"></span>
    <span class="tool-body">
      <p class="tool-name">${escapeHtml(tool.name)}</p>
      <p class="tool-desc">${escapeHtml(tool.description || '')}</p>
      <p class="tool-meta">${escapeHtml(tool.category)}</p>
    </span>
    <button type="button" class="fav-btn ${isFav ? 'active' : ''}" title="${isFav ? 'Remove favorite' : 'Add favorite'}" aria-label="Toggle favorite">${isFav ? '★' : '☆'}</button>
  `;

  item.addEventListener('click', (e) => {
    if (e.target.closest('.fav-btn')) return;
    openTool(tool.slug);
  });

  item.querySelector('.fav-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    state.favorites = await toggleFavorite(tool.slug);
    render();
  });

  return item;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getVisibleTools() {
  let list;
  if (state.view === 'favorites') {
    list = state.tools.filter((t) => state.favorites.includes(t.slug));
  } else if (state.view === 'recent') {
    list = state.recent
      .map((slug) => state.tools.find((t) => t.slug === slug))
      .filter(Boolean);
  } else {
    list = filterTools(state.tools, { query: state.query, category: state.category });
    return list;
  }
  if (!state.query.trim()) return list;
  return filterTools(list, { query: state.query });
}

function renderCategories() {
  els.categories.innerHTML = '';
  if (state.view !== 'all') {
    els.categories.classList.add('hidden');
    return;
  }
  els.categories.classList.remove('hidden');

  const allPill = document.createElement('button');
  allPill.type = 'button';
  allPill.className = `cat-pill ${!state.category ? 'active' : ''}`;
  allPill.textContent = 'All';
  allPill.addEventListener('click', () => {
    state.category = '';
    render();
  });
  els.categories.appendChild(allPill);

  getCategories(state.tools).forEach((cat) => {
    const meta = CATEGORY_META[cat] || {};
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = `cat-pill ${state.category === cat ? 'active' : ''}`;
    pill.textContent = `${meta.emoji || ''} ${cat.replace(' Tools', '').replace('/', '/')}`;
    pill.addEventListener('click', () => {
      state.category = state.category === cat ? '' : cat;
      render();
    });
    els.categories.appendChild(pill);
  });
}

function render() {
  const visible = getVisibleTools();
  els.toolList.innerHTML = '';

  if (visible.length === 0) {
    els.empty.classList.remove('hidden');
  } else {
    els.empty.classList.add('hidden');
    visible.forEach((tool) => els.toolList.appendChild(renderToolItem(tool)));
  }

  renderCategories();
  els.toolCount.textContent = `${state.tools.length} free tools`;
}

async function init() {
  state.settings = await getSettings();
  state.tools = await loadTools();
  state.favorites = await getFavorites();
  state.recent = await getRecent();

  applyTheme(state.settings.theme);

  const siteUrl = state.settings.siteUrl;
  els.openSite.href = siteUrl;
  els.footerSite.href = siteUrl;
  els.footerSite.textContent = siteUrl.replace(/^https?:\/\//, '');

  els.search.addEventListener('input', () => {
    state.query = els.search.value;
    if (state.view !== 'all') {
      state.view = 'all';
      els.viewTabs.querySelectorAll('.tab').forEach((t) => {
        t.classList.toggle('active', t.dataset.view === 'all');
      });
    }
    render();
  });

  els.viewTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    state.view = tab.dataset.view;
    els.viewTabs.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    if (state.view !== 'all') {
      state.category = '';
      els.search.value = '';
      state.query = '';
    }
    render();
  });

  els.themeToggle.addEventListener('click', async () => {
    const current = state.settings.theme;
    const next = current === 'dark' ? 'light' : current === 'light' ? 'system' : 'dark';
    state.settings.theme = next;
    await chrome.storage.sync.set({ [STORAGE_KEYS.theme]: next });
    applyTheme(next);
  });

  els.optionsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
  els.openSite.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: siteUrl });
  });

  els.search.focus();
  render();
}

init().catch((err) => {
  els.toolCount.textContent = 'Failed to load';
  els.empty.textContent = err.message || 'Could not load tools.';
  els.empty.classList.remove('hidden');
});
