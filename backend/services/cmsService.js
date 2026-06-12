const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const CONTENT_FILE = path.join(__dirname, '../data/seo-content.json');
const MEDIA_DIR = path.join(__dirname, '../uploads/cms');
const MAX_REVISIONS = 10;
const MAX_ACTIVITY = 500;

const DEFAULT_NAVIGATION = {
  header: [
    { id: 'nav-home', label: 'Home', href: '/', external: false, openInNewTab: false, enabled: true, order: 0 },
    { id: 'nav-tools', label: 'Tools', href: '/#tools', external: false, openInNewTab: false, enabled: true, order: 1 },
    { id: 'nav-blog', label: 'Blog', href: '/blog', external: false, openInNewTab: false, enabled: true, order: 2 },
    { id: 'nav-about', label: 'About', href: '/about', external: false, openInNewTab: false, enabled: true, order: 3 },
    { id: 'nav-contact', label: 'Contact', href: '/contact', external: false, openInNewTab: false, enabled: true, order: 4 }
  ],
  footer: [
    { id: 'footer-blog', label: 'Blog', href: '/blog', external: false, openInNewTab: false, enabled: true, order: 0, group: 'Resources' },
    { id: 'footer-about', label: 'About', href: '/about', external: false, openInNewTab: false, enabled: true, order: 1, group: 'Resources' },
    { id: 'footer-contact', label: 'Contact', href: '/contact', external: false, openInNewTab: false, enabled: true, order: 2, group: 'Resources' }
  ],
  footerBrand: {
    title: 'UtilityTools',
    description: 'Free online tools for PDF, image, video, text, developers, security, and more.',
    statusText: 'All systems online'
  },
  cta: { label: 'Explore Tools', href: '/#tools' }
};

function createId(prefix = 'id') {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

function nowIso() {
  return new Date().toISOString();
}

function defaultStore() {
  return {
    tools: {},
    blogs: {},
    pages: {},
    toolSettings: {},
    navigation: DEFAULT_NAVIGATION,
    media: [],
    activityLog: [],
    cacheVersion: 1
  };
}

async function ensureContentFile() {
  try {
    await fs.access(CONTENT_FILE);
  } catch {
    await fs.mkdir(path.dirname(CONTENT_FILE), { recursive: true });
    await fs.writeFile(CONTENT_FILE, JSON.stringify(defaultStore(), null, 2));
  }
  await fs.mkdir(MEDIA_DIR, { recursive: true });
}

function normalizeStore(raw) {
  const base = defaultStore();
  return {
    ...base,
    ...raw,
    tools: raw?.tools || {},
    blogs: raw?.blogs || {},
    pages: raw?.pages || {},
    toolSettings: raw?.toolSettings || {},
    navigation: { ...DEFAULT_NAVIGATION, ...(raw?.navigation || {}) },
    media: raw?.media || [],
    activityLog: raw?.activityLog || [],
    cacheVersion: raw?.cacheVersion || 1
  };
}

async function readContentStore() {
  await ensureContentFile();
  const raw = await fs.readFile(CONTENT_FILE, 'utf8');
  return normalizeStore(JSON.parse(raw || '{}'));
}

async function writeContentStore(data, { bumpCache = true } = {}) {
  await ensureContentFile();
  const next = { ...data };
  if (bumpCache) next.cacheVersion = (next.cacheVersion || 1) + 1;
  await fs.writeFile(CONTENT_FILE, JSON.stringify(next, null, 2));
  return next;
}

async function logActivity(action, details = {}) {
  const store = await readContentStore();
  store.activityLog = [
    { id: createId('log'), action, details, createdAt: nowIso() },
    ...(store.activityLog || [])
  ].slice(0, MAX_ACTIVITY);
  await writeContentStore(store, { bumpCache: false });
}

function buildDefaultPage(id, slug, title, sections = []) {
  return {
    id,
    slug,
    title,
    content: {},
    sections,
    seo: {
      metaTitle: title,
      metaDescription: '',
      canonicalUrl: `/${slug === 'home' ? '' : slug}`.replace(/\/$/, '') || '/',
      ogTitle: title,
      ogDescription: '',
      ogImage: '',
      schemaJson: null,
      robotsIndex: true
    },
    status: 'published',
    scheduledAt: null,
    revisions: [],
    updatedAt: nowIso()
  };
}

function getDefaultPages() {
  return {
    home: buildDefaultPage('home', 'home', 'Home', [
      { id: 'hero', name: 'Hero', enabled: true, order: 0, content: { badge: '', title: 'Every tool you need.', titleAccent: 'One beautiful workspace.', subtitle: 'PDF, image, video, AI, developer, and security utilities — fast, private, and built for everyday productivity.', primaryButton: { label: 'Browse all tools', href: '#tools' }, secondaryButton: { label: 'Read guides', href: '/blog' } } },
      { id: 'categoryShowcase', name: 'Category Showcase', enabled: true, order: 1, content: {} },
      { id: 'featuredTools', name: 'Featured Tools', enabled: true, order: 2, content: { title: 'Hand-picked essentials', eyebrow: 'Featured' } },
      { id: 'trendingTools', name: 'Trending Tools', enabled: true, order: 3, content: { title: 'Trending now', eyebrow: 'Popular' } },
      { id: 'recentTools', name: 'Recent Tools', enabled: true, order: 4, content: { title: 'Recently used', eyebrow: 'Your history' } },
      { id: 'featuresStrip', name: 'Features Strip', enabled: true, order: 5, content: { items: [] } },
      { id: 'toolsSection', name: 'Tools Section', enabled: true, order: 6, content: { title: 'All tools', eyebrow: 'Browse' } },
      { id: 'blogSection', name: 'Blog Section', enabled: true, order: 7, content: { title: 'Latest from the blog', eyebrow: 'Guides & tips' } },
      { id: 'ctaBanner', name: 'CTA Banner', enabled: true, order: 8, content: { eyebrow: 'Start now', title: 'Ready to get things done?', description: 'Pick a tool, upload your file, and download the result — no account, no hassle.', primaryButton: { label: 'Explore tools', href: '#tools' }, secondaryButton: { label: 'Contact us', href: '/contact' } } }
    ]),
    about: buildDefaultPage('about', 'about', 'About', [
      { id: 'header', name: 'Header', enabled: true, order: 0, content: { badge: 'About', title: 'Built for everyday work', titleAccent: 'everyday work', subtitle: 'All-in-One Utility Tools groups essential daily utilities into one clean, premium interface.' } },
      { id: 'features', name: 'Features Grid', enabled: true, order: 1, content: { items: [] } }
    ]),
    contact: buildDefaultPage('contact', 'contact', 'Contact', [
      { id: 'header', name: 'Header', enabled: true, order: 0, content: { badge: 'Contact', title: 'Get in touch', titleAccent: 'touch', subtitle: 'Questions, feature requests, or bug reports — send us a message.' } },
      { id: 'form', name: 'Contact Form', enabled: true, order: 1, content: { submitLabel: 'Send Message' } }
    ]),
    footer: buildDefaultPage('footer', 'footer', 'Footer', [
      { id: 'brand', name: 'Brand', enabled: true, order: 0, content: DEFAULT_NAVIGATION.footerBrand },
      { id: 'links', name: 'Footer Links', enabled: true, order: 1, content: {} }
    ]),
    header: buildDefaultPage('header', 'header', 'Header', [
      { id: 'brand', name: 'Brand', enabled: true, order: 0, content: { title: 'UtilityTools' } },
      { id: 'cta', name: 'Header CTA', enabled: true, order: 1, content: DEFAULT_NAVIGATION.cta }
    ])
  };
}

async function ensureDefaultPages() {
  const store = await readContentStore();
  const defaults = getDefaultPages();
  let changed = false;
  Object.values(defaults).forEach((page) => {
    if (!store.pages[page.id]) {
      store.pages[page.id] = page;
      changed = true;
    }
  });
  if (changed) await writeContentStore(store, { bumpCache: false });
}

function validatePagePayload(payload = {}) {
  if (!payload.slug || typeof payload.slug !== 'string') {
    throw Object.assign(new Error('Page slug is required.'), { status: 400 });
  }
  if (payload.status && !['draft', 'published', 'scheduled'].includes(payload.status)) {
    throw Object.assign(new Error('Invalid page status.'), { status: 400 });
  }
}

function pushRevision(page, actor = 'admin') {
  const snapshot = {
    id: createId('rev'),
    savedAt: nowIso(),
    actor,
    page: {
      title: page.title,
      content: page.content,
      sections: page.sections,
      seo: page.seo,
      status: page.status
    }
  };
  page.revisions = [snapshot, ...(page.revisions || [])].slice(0, MAX_REVISIONS);
}

async function listPages({ includeDrafts = false } = {}) {
  await ensureDefaultPages();
  const store = await readContentStore();
  const pages = Object.values(store.pages || {});
  return includeDrafts ? pages : pages.filter((p) => p.status === 'published' || !p.status);
}

async function getPageById(id) {
  await ensureDefaultPages();
  const store = await readContentStore();
  return store.pages[id] || null;
}

async function getPageBySlug(slug) {
  const pages = await listPages({ includeDrafts: true });
  return pages.find((p) => p.slug === slug) || null;
}

async function createPage(payload, actor = 'admin') {
  validatePagePayload(payload);
  const store = await readContentStore();
  const id = payload.id || createId('page');
  if (store.pages[id]) throw Object.assign(new Error('Page already exists.'), { status: 409 });
  const duplicate = Object.values(store.pages).find((p) => p.slug === payload.slug);
  if (duplicate) throw Object.assign(new Error('Page slug already in use.'), { status: 409 });

  const page = {
    ...buildDefaultPage(id, payload.slug, payload.title || payload.slug),
    ...payload,
    id,
    updatedAt: nowIso()
  };
  store.pages[id] = page;
  await writeContentStore(store);
  await logActivity('page.create', { id, slug: page.slug, actor });
  return page;
}

async function updatePage(id, payload, actor = 'admin') {
  const store = await readContentStore();
  const existing = store.pages[id];
  if (!existing) throw Object.assign(new Error('Page not found.'), { status: 404 });
  validatePagePayload({ ...existing, ...payload });

  pushRevision(existing, actor);
  const updated = {
    ...existing,
    ...payload,
    id,
    updatedAt: nowIso()
  };
  store.pages[id] = updated;
  await writeContentStore(store);
  await logActivity('page.update', { id, slug: updated.slug, status: updated.status, actor });
  return updated;
}

async function deletePage(id, actor = 'admin') {
  const store = await readContentStore();
  const existing = store.pages[id];
  if (!existing) throw Object.assign(new Error('Page not found.'), { status: 404 });
  const protectedIds = ['home', 'about', 'contact', 'footer', 'header'];
  if (protectedIds.includes(id)) {
    throw Object.assign(new Error('Built-in pages cannot be deleted.'), { status: 400 });
  }
  delete store.pages[id];
  await writeContentStore(store);
  await logActivity('page.delete', { id, slug: existing.slug, actor });
  return { deleted: true, id };
}

async function restorePageRevision(id, revisionId, actor = 'admin') {
  const store = await readContentStore();
  const page = store.pages[id];
  if (!page) throw Object.assign(new Error('Page not found.'), { status: 404 });
  const revision = (page.revisions || []).find((r) => r.id === revisionId);
  if (!revision) throw Object.assign(new Error('Revision not found.'), { status: 404 });
  pushRevision(page, actor);
  Object.assign(page, revision.page, { updatedAt: nowIso() });
  store.pages[id] = page;
  await writeContentStore(store);
  await logActivity('page.restore', { id, revisionId, actor });
  return page;
}

function defaultToolSetting(tool, index) {
  return {
    id: tool.slug,
    toolName: tool.name,
    slug: tool.slug,
    enabled: true,
    featured: false,
    maintenanceMode: false,
    hiddenFromSearch: false,
    hiddenFromHomepage: false,
    hiddenFromNavigation: false,
    order: index,
    scheduledEnableAt: null,
    scheduledDisableAt: null,
    maintenanceMessage: 'This tool is temporarily unavailable for maintenance.',
    updatedAt: nowIso()
  };
}

function applyScheduledToolState(setting) {
  const now = Date.now();
  const next = { ...setting };
  if (next.scheduledDisableAt && new Date(next.scheduledDisableAt).getTime() <= now) {
    next.enabled = false;
  }
  if (next.scheduledEnableAt && new Date(next.scheduledEnableAt).getTime() <= now) {
    next.enabled = true;
  }
  return next;
}

async function listToolSettings(catalog = []) {
  const store = await readContentStore();
  const map = { ...(store.toolSettings || {}) };
  catalog.forEach((tool, index) => {
    if (!map[tool.slug]) map[tool.slug] = defaultToolSetting(tool, index);
  });
  return Object.values(map)
    .map(applyScheduledToolState)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

async function getToolSetting(slug) {
  const store = await readContentStore();
  const setting = store.toolSettings?.[slug];
  return setting ? applyScheduledToolState(setting) : null;
}

async function saveToolSetting(slug, payload, actor = 'admin') {
  const store = await readContentStore();
  store.toolSettings = store.toolSettings || {};
  const existing = store.toolSettings[slug] || { id: slug, slug, toolName: slug };
  store.toolSettings[slug] = {
    ...existing,
    ...payload,
    slug,
    id: slug,
    updatedAt: nowIso()
  };
  await writeContentStore(store);
  await logActivity('tool.update', { slug, ...payload, actor });
  return store.toolSettings[slug];
}

async function toggleTools(slugs = [], enabled = true, actor = 'admin') {
  const results = [];
  for (const slug of slugs) {
    results.push(await saveToolSetting(slug, { enabled }, actor));
  }
  await logActivity('tool.bulkToggle', { slugs, enabled, actor });
  return results;
}

async function reorderTools(orderedSlugs = [], actor = 'admin') {
  const store = await readContentStore();
  store.toolSettings = store.toolSettings || {};
  orderedSlugs.forEach((slug, index) => {
    store.toolSettings[slug] = {
      ...(store.toolSettings[slug] || { id: slug, slug }),
      order: index,
      updatedAt: nowIso()
    };
  });
  await writeContentStore(store);
  await logActivity('tool.reorder', { count: orderedSlugs.length, actor });
  return listToolSettings(orderedSlugs.map((slug) => ({ slug, name: slug })));
}

async function getNavigation() {
  const store = await readContentStore();
  return store.navigation || DEFAULT_NAVIGATION;
}

async function saveNavigation(payload, actor = 'admin') {
  const store = await readContentStore();
  store.navigation = {
    ...DEFAULT_NAVIGATION,
    ...store.navigation,
    ...payload
  };
  await writeContentStore(store);
  await logActivity('navigation.update', { actor });
  return store.navigation;
}

async function listMedia() {
  const store = await readContentStore();
  return store.media || [];
}

async function addMediaRecord(record, actor = 'admin') {
  const store = await readContentStore();
  const item = { id: createId('media'), ...record, createdAt: nowIso() };
  store.media = [item, ...(store.media || [])];
  await writeContentStore(store, { bumpCache: false });
  await logActivity('media.upload', { id: item.id, filename: item.filename, actor });
  return item;
}

async function deleteMedia(id, actor = 'admin') {
  const store = await readContentStore();
  const item = (store.media || []).find((m) => m.id === id);
  if (!item) throw Object.assign(new Error('Media not found.'), { status: 404 });
  store.media = store.media.filter((m) => m.id !== id);
  await writeContentStore(store, { bumpCache: false });
  if (item.localPath) {
    await fs.unlink(item.localPath).catch(() => {});
  }
  await logActivity('media.delete', { id, actor });
  return { deleted: true, id };
}

async function getActivityLog(limit = 50) {
  const store = await readContentStore();
  return (store.activityLog || []).slice(0, limit);
}

async function getCacheVersion() {
  const store = await readContentStore();
  return store.cacheVersion || 1;
}

function formatActionLabel(action = '') {
  return action
    .replace(/\./g, ' · ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function lastNDays(count) {
  const days = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    days.push(date.toISOString().slice(0, 10));
  }
  return days;
}

async function getDashboardStats(catalogToolCount = 0) {
  await ensureDefaultPages();
  const store = await readContentStore();
  const pages = Object.values(store.pages || {});
  const toolSettings = Object.values(store.toolSettings || {});
  const activityLog = store.activityLog || [];

  const activityByDayMap = {};
  const activityByTypeMap = {};

  activityLog.forEach((entry) => {
    const day = String(entry.createdAt || '').slice(0, 10);
    if (!day) return;
    activityByDayMap[day] = (activityByDayMap[day] || 0) + 1;
    activityByTypeMap[entry.action] = (activityByTypeMap[entry.action] || 0) + 1;
  });

  const activityByDay = lastNDays(14).map((date) => ({
    date,
    label: new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: activityByDayMap[date] || 0
  }));

  const activityByType = Object.entries(activityByTypeMap)
    .map(([action, count]) => ({ action: formatActionLabel(action), rawAction: action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const enabledTools = toolSettings.filter((item) => item.enabled !== false).length;
  const disabledTools = toolSettings.filter((item) => item.enabled === false).length;
  const maintenanceTools = toolSettings.filter((item) => item.maintenanceMode === true).length;
  const featuredTools = toolSettings.filter((item) => item.featured === true).length;
  const effectiveEnabled = toolSettings.length ? enabledTools : catalogToolCount;

  const toolStatus = [
    { name: 'Enabled', value: effectiveEnabled, color: '#10b981' },
    { name: 'Disabled', value: disabledTools, color: '#ef4444' },
    { name: 'Maintenance', value: maintenanceTools, color: '#f59e0b' },
    { name: 'Featured', value: featuredTools, color: '#8b5cf6' }
  ].filter((item) => item.value > 0);

  const pageStatus = [
    { name: 'Published', value: pages.filter((page) => page.status === 'published' || !page.status).length, color: '#10b981' },
    { name: 'Draft', value: pages.filter((page) => page.status === 'draft').length, color: '#64748b' },
    { name: 'Scheduled', value: pages.filter((page) => page.status === 'scheduled').length, color: '#3b82f6' }
  ].filter((item) => item.value > 0);

  return {
    summary: {
      totalPages: pages.length,
      publishedPages: pages.filter((page) => page.status === 'published' || !page.status).length,
      draftPages: pages.filter((page) => page.status === 'draft').length,
      catalogTools: catalogToolCount,
      configuredTools: toolSettings.length,
      enabledTools: effectiveEnabled,
      disabledTools,
      maintenanceTools,
      featuredTools,
      seoToolOverrides: Object.keys(store.tools || {}).length,
      seoBlogOverrides: Object.keys(store.blogs || {}).length,
      mediaCount: (store.media || []).length,
      cacheVersion: store.cacheVersion || 1,
      totalActivity: activityLog.length
    },
    activityByDay,
    activityByType,
    toolStatus,
    pageStatus,
    contentCoverage: [
      { name: 'Tool SEO', count: Object.keys(store.tools || {}).length },
      { name: 'Blog CMS', count: Object.keys(store.blogs || {}).length },
      { name: 'Pages', count: pages.length },
      { name: 'Media', count: (store.media || []).length }
    ],
    recentActivity: activityLog.slice(0, 12)
  };
}

module.exports = {
  CONTENT_FILE,
  MEDIA_DIR,
  readContentStore,
  writeContentStore,
  logActivity,
  listPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  restorePageRevision,
  listToolSettings,
  getToolSetting,
  saveToolSetting,
  toggleTools,
  reorderTools,
  getNavigation,
  saveNavigation,
  listMedia,
  addMediaRecord,
  deleteMedia,
  getActivityLog,
  getCacheVersion,
  getDashboardStats,
  getDefaultPages,
  DEFAULT_NAVIGATION
};
