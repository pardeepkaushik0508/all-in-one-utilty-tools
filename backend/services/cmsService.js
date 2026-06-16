const path = require('path');
const fs = require('fs/promises');
const { getPrisma } = require('../prisma/client');
const {
  createId,
  nowIso,
  bumpCacheVersion,
  getCacheVersionValue,
  wrapDbError
} = require('./dbHelpers');

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
    { id: 'footer-contact', label: 'Contact', href: '/contact', external: false, openInNewTab: false, enabled: true, order: 2, group: 'Resources' },
    { id: 'footer-privacy', label: 'Privacy Policy', href: '/privacy-policy', external: false, openInNewTab: false, enabled: true, order: 3, group: 'Resources' },
    { id: 'footer-terms', label: 'Terms & Conditions', href: '/terms-and-conditions', external: false, openInNewTab: false, enabled: true, order: 4, group: 'Resources' }
  ],
  footerBrand: {
    title: 'UtilityTools',
    description: 'Free online tools for PDF, image, video, text, developers, security, and more.',
    statusText: 'All systems online'
  },
  cta: { label: 'Explore Tools', href: '/#tools' }
};

function ensureFooterLinks(navigation) {
  const next = { ...navigation };
  const footer = Array.isArray(next.footer) ? [...next.footer] : [];

  const ensure = (item) => {
    if (footer.some((link) => link?.href === item.href)) return;
    footer.push(item);
  };

  ensure({ id: 'footer-privacy', label: 'Privacy Policy', href: '/privacy-policy', external: false, openInNewTab: false, enabled: true, order: 90, group: 'Resources' });
  ensure({ id: 'footer-terms', label: 'Terms & Conditions', href: '/terms-and-conditions', external: false, openInNewTab: false, enabled: true, order: 91, group: 'Resources' });

  next.footer = footer;
  return next;
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

function mapPageRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content || {},
    sections: row.sections || [],
    seo: row.seo || {},
    status: row.status || 'published',
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    revisions: row.revisions || [],
    updatedAt: row.updatedAt.toISOString()
  };
}

async function ensureMediaDir() {
  await fs.mkdir(MEDIA_DIR, { recursive: true });
}

async function ensureDefaultPages() {
  const prisma = getPrisma();
  const defaults = getDefaultPages();
  for (const page of Object.values(defaults)) {
    await prisma.cmsPage.upsert({
      where: { id: page.id },
      create: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        content: page.content,
        sections: page.sections,
        seo: page.seo,
        status: page.status,
        revisions: page.revisions,
        updatedAt: new Date(page.updatedAt)
      },
      update: {}
    });
  }
}

async function logActivity(action, details = {}) {
  try {
    const prisma = getPrisma();
    await prisma.activityLog.create({
      data: {
        id: createId('log'),
        action,
        details,
        createdAt: new Date()
      }
    });
    const count = await prisma.activityLog.count();
    if (count > MAX_ACTIVITY) {
      const oldest = await prisma.activityLog.findMany({
        orderBy: { createdAt: 'asc' },
        take: count - MAX_ACTIVITY,
        select: { id: true }
      });
      if (oldest.length) {
        await prisma.activityLog.deleteMany({ where: { id: { in: oldest.map((r) => r.id) } } });
      }
    }
  } catch (error) {
    console.error('logActivity error:', error.message);
  }
}

async function readContentStore() {
  const prisma = getPrisma();
  await ensureDefaultPages();

  const [pages, toolSeoRows, toolSettings, navigationRow, media, activityLog, cacheVersion, blogCount] = await Promise.all([
    prisma.cmsPage.findMany(),
    prisma.toolSeoContent.findMany(),
    prisma.toolSetting.findMany(),
    prisma.navigationConfig.findUnique({ where: { id: 'default' } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: MAX_ACTIVITY }),
    getCacheVersionValue(),
    prisma.blog.count()
  ]);

  const tools = {};
  toolSeoRows.forEach((row) => {
    tools[row.slug] = row.data;
  });

  const toolSettingsMap = {};
  toolSettings.forEach((row) => {
    toolSettingsMap[row.slug] = mapToolSettingRow(row);
  });

  const pagesMap = {};
  pages.forEach((row) => {
    pagesMap[row.id] = mapPageRow(row);
  });

  return {
    tools,
    blogs: {},
    pages: pagesMap,
    toolSettings: toolSettingsMap,
    navigation: navigationRow?.data || DEFAULT_NAVIGATION,
    media: media.map(mapMediaRow),
    activityLog: activityLog.map((row) => ({
      id: row.id,
      action: row.action,
      details: row.details || {},
      createdAt: row.createdAt.toISOString()
    })),
    cacheVersion,
    blogCount
  };
}

function mapMediaRow(row) {
  return {
    id: row.id,
    filename: row.filename,
    storedName: row.storedName,
    mimeType: row.mimeType,
    size: row.size,
    url: row.url,
    storage: row.storage,
    localPath: row.localPath,
    createdAt: row.createdAt.toISOString()
  };
}

function mapToolSettingRow(row) {
  return {
    id: row.slug,
    slug: row.slug,
    toolName: row.toolName,
    enabled: row.enabled,
    featured: row.featured,
    maintenanceMode: row.maintenanceMode,
    hiddenFromSearch: row.hiddenFromSearch,
    hiddenFromHomepage: row.hiddenFromHomepage,
    hiddenFromNavigation: row.hiddenFromNavigation,
    order: row.order,
    scheduledEnableAt: row.scheduledEnableAt ? row.scheduledEnableAt.toISOString() : null,
    scheduledDisableAt: row.scheduledDisableAt ? row.scheduledDisableAt.toISOString() : null,
    maintenanceMessage: row.maintenanceMessage,
    updatedAt: row.updatedAt.toISOString()
  };
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
  const prisma = getPrisma();
  const pages = await prisma.cmsPage.findMany();
  const mapped = pages.map(mapPageRow);
  return includeDrafts ? mapped : mapped.filter((p) => p.status === 'published' || !p.status);
}

async function getPageById(id) {
  await ensureDefaultPages();
  const prisma = getPrisma();
  const row = await prisma.cmsPage.findUnique({ where: { id } });
  return mapPageRow(row);
}

async function getPageBySlug(slug) {
  const pages = await listPages({ includeDrafts: true });
  return pages.find((p) => p.slug === slug) || null;
}

async function createPage(payload, actor = 'admin') {
  validatePagePayload(payload);
  const prisma = getPrisma();
  const id = payload.id || createId('page');
  const existing = await prisma.cmsPage.findUnique({ where: { id } });
  if (existing) throw Object.assign(new Error('Page already exists.'), { status: 409 });

  const duplicate = await prisma.cmsPage.findUnique({ where: { slug: payload.slug } });
  if (duplicate) throw Object.assign(new Error('Page slug already in use.'), { status: 409 });

  const page = {
    ...buildDefaultPage(id, payload.slug, payload.title || payload.slug),
    ...payload,
    id,
    updatedAt: nowIso()
  };

  await prisma.cmsPage.create({
    data: {
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      sections: page.sections,
      seo: page.seo,
      status: page.status,
      scheduledAt: page.scheduledAt ? new Date(page.scheduledAt) : null,
      revisions: page.revisions,
      updatedAt: new Date()
    }
  });

  await bumpCacheVersion();
  await logActivity('page.create', { id, slug: page.slug, actor });
  return page;
}

async function updatePage(id, payload, actor = 'admin') {
  const prisma = getPrisma();
  const existing = await prisma.cmsPage.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Page not found.'), { status: 404 });
  validatePagePayload({ ...mapPageRow(existing), ...payload });

  const page = mapPageRow(existing);
  pushRevision(page, actor);
  const updated = {
    ...page,
    ...payload,
    id,
    updatedAt: nowIso()
  };

  await prisma.cmsPage.update({
    where: { id },
    data: {
      slug: updated.slug,
      title: updated.title,
      content: updated.content,
      sections: updated.sections,
      seo: updated.seo,
      status: updated.status,
      scheduledAt: updated.scheduledAt ? new Date(updated.scheduledAt) : null,
      revisions: updated.revisions,
      updatedAt: new Date()
    }
  });

  await bumpCacheVersion();
  await logActivity('page.update', { id, slug: updated.slug, status: updated.status, actor });
  return updated;
}

async function deletePage(id, actor = 'admin') {
  const prisma = getPrisma();
  const existing = await prisma.cmsPage.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Page not found.'), { status: 404 });
  const protectedIds = ['home', 'about', 'contact', 'footer', 'header'];
  if (protectedIds.includes(id)) {
    throw Object.assign(new Error('Built-in pages cannot be deleted.'), { status: 400 });
  }
  await prisma.cmsPage.delete({ where: { id } });
  await bumpCacheVersion();
  await logActivity('page.delete', { id, slug: existing.slug, actor });
  return { deleted: true, id };
}

async function restorePageRevision(id, revisionId, actor = 'admin') {
  const prisma = getPrisma();
  const existing = await prisma.cmsPage.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Page not found.'), { status: 404 });

  const page = mapPageRow(existing);
  const revision = (page.revisions || []).find((r) => r.id === revisionId);
  if (!revision) throw Object.assign(new Error('Revision not found.'), { status: 404 });

  pushRevision(page, actor);
  Object.assign(page, revision.page, { updatedAt: nowIso() });

  await prisma.cmsPage.update({
    where: { id },
    data: {
      title: page.title,
      content: page.content,
      sections: page.sections,
      seo: page.seo,
      status: page.status,
      revisions: page.revisions,
      updatedAt: new Date()
    }
  });

  await bumpCacheVersion();
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
  const prisma = getPrisma();
  const rows = await prisma.toolSetting.findMany();
  const map = {};
  rows.forEach((row) => {
    map[row.slug] = mapToolSettingRow(row);
  });
  catalog.forEach((tool, index) => {
    if (!map[tool.slug]) map[tool.slug] = defaultToolSetting(tool, index);
  });
  return Object.values(map)
    .map(applyScheduledToolState)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

async function getToolSetting(slug) {
  const prisma = getPrisma();
  const row = await prisma.toolSetting.findUnique({ where: { slug } });
  return row ? applyScheduledToolState(mapToolSettingRow(row)) : null;
}

async function saveToolSetting(slug, payload, actor = 'admin') {
  const prisma = getPrisma();
  const existing = await prisma.toolSetting.findUnique({ where: { slug } });
  const merged = {
    ...(existing ? mapToolSettingRow(existing) : { id: slug, slug, toolName: slug }),
    ...payload,
    slug,
    id: slug,
    updatedAt: nowIso()
  };

  await prisma.toolSetting.upsert({
    where: { slug },
    create: {
      slug,
      toolName: merged.toolName,
      enabled: merged.enabled !== false,
      featured: merged.featured === true,
      maintenanceMode: merged.maintenanceMode === true,
      hiddenFromSearch: merged.hiddenFromSearch === true,
      hiddenFromHomepage: merged.hiddenFromHomepage === true,
      hiddenFromNavigation: merged.hiddenFromNavigation === true,
      order: merged.order ?? 0,
      scheduledEnableAt: merged.scheduledEnableAt ? new Date(merged.scheduledEnableAt) : null,
      scheduledDisableAt: merged.scheduledDisableAt ? new Date(merged.scheduledDisableAt) : null,
      maintenanceMessage: merged.maintenanceMessage,
      updatedAt: new Date()
    },
    update: {
      toolName: merged.toolName,
      enabled: merged.enabled !== false,
      featured: merged.featured === true,
      maintenanceMode: merged.maintenanceMode === true,
      hiddenFromSearch: merged.hiddenFromSearch === true,
      hiddenFromHomepage: merged.hiddenFromHomepage === true,
      hiddenFromNavigation: merged.hiddenFromNavigation === true,
      order: merged.order ?? 0,
      scheduledEnableAt: merged.scheduledEnableAt ? new Date(merged.scheduledEnableAt) : null,
      scheduledDisableAt: merged.scheduledDisableAt ? new Date(merged.scheduledDisableAt) : null,
      maintenanceMessage: merged.maintenanceMessage,
      updatedAt: new Date()
    }
  });

  await bumpCacheVersion();
  await logActivity('tool.update', { slug, ...payload, actor });
  return merged;
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
  for (const [index, slug] of orderedSlugs.entries()) {
    await saveToolSetting(slug, { order: index }, actor);
  }
  await logActivity('tool.reorder', { count: orderedSlugs.length, actor });
  return listToolSettings(orderedSlugs.map((slug) => ({ slug, name: slug })));
}

async function getNavigation() {
  const prisma = getPrisma();
  const row = await prisma.navigationConfig.findUnique({ where: { id: 'default' } });
  const base = row?.data || DEFAULT_NAVIGATION;
  return ensureFooterLinks({ ...DEFAULT_NAVIGATION, ...base, footerBrand: base.footerBrand || DEFAULT_NAVIGATION.footerBrand, cta: base.cta || DEFAULT_NAVIGATION.cta, footer: base.footer || DEFAULT_NAVIGATION.footer, header: base.header || DEFAULT_NAVIGATION.header });
}

async function saveNavigation(payload, actor = 'admin') {
  const prisma = getPrisma();
  const current = await getNavigation();
  const next = { ...DEFAULT_NAVIGATION, ...current, ...payload };

  await prisma.navigationConfig.upsert({
    where: { id: 'default' },
    create: { id: 'default', data: next, updatedAt: new Date() },
    update: { data: next, updatedAt: new Date() }
  });

  await bumpCacheVersion();
  await logActivity('navigation.update', { actor });
  return next;
}

async function listMedia() {
  const prisma = getPrisma();
  const rows = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map(mapMediaRow);
}

async function addMediaRecord(record, actor = 'admin') {
  await ensureMediaDir();
  const prisma = getPrisma();
  const item = {
    id: createId('media'),
    ...record,
    createdAt: nowIso()
  };

  await prisma.mediaAsset.create({
    data: {
      id: item.id,
      filename: item.filename,
      storedName: item.storedName,
      mimeType: item.mimeType,
      size: item.size,
      url: item.url,
      storage: item.storage,
      localPath: item.localPath,
      createdAt: new Date()
    }
  });

  await logActivity('media.upload', { id: item.id, filename: item.filename, actor });
  return item;
}

async function deleteMedia(id, actor = 'admin') {
  const prisma = getPrisma();
  const item = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!item) throw Object.assign(new Error('Media not found.'), { status: 404 });

  await prisma.mediaAsset.delete({ where: { id } });
  if (item.localPath) {
    await fs.unlink(item.localPath).catch(() => {});
  }
  await logActivity('media.delete', { id, actor });
  return { deleted: true, id };
}

async function getActivityLog(limit = 50) {
  const prisma = getPrisma();
  const rows = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit
  });
  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    details: row.details || {},
    createdAt: row.createdAt.toISOString()
  }));
}

async function getCacheVersion() {
  return getCacheVersionValue();
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
  const prisma = getPrisma();
  await ensureDefaultPages();

  const [pages, toolSettings, activityLog, seoToolCount, blogCount, mediaCount, cacheVersion] = await Promise.all([
    prisma.cmsPage.findMany(),
    prisma.toolSetting.findMany(),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: MAX_ACTIVITY }),
    prisma.toolSeoContent.count(),
    prisma.blog.count(),
    prisma.mediaAsset.count(),
    getCacheVersionValue()
  ]);

  const mappedPages = pages.map(mapPageRow);
  const mappedSettings = toolSettings.map((row) => applyScheduledToolState(mapToolSettingRow(row)));

  const activityByDayMap = {};
  const activityByTypeMap = {};

  activityLog.forEach((entry) => {
    const day = entry.createdAt.toISOString().slice(0, 10);
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

  const enabledTools = mappedSettings.filter((item) => item.enabled !== false).length;
  const disabledTools = mappedSettings.filter((item) => item.enabled === false).length;
  const maintenanceTools = mappedSettings.filter((item) => item.maintenanceMode === true).length;
  const featuredTools = mappedSettings.filter((item) => item.featured === true).length;
  const effectiveEnabled = mappedSettings.length ? enabledTools : catalogToolCount;

  const toolStatus = [
    { name: 'Enabled', value: effectiveEnabled, color: '#10b981' },
    { name: 'Disabled', value: disabledTools, color: '#ef4444' },
    { name: 'Maintenance', value: maintenanceTools, color: '#f59e0b' },
    { name: 'Featured', value: featuredTools, color: '#8b5cf6' }
  ].filter((item) => item.value > 0);

  const pageStatus = [
    { name: 'Published', value: mappedPages.filter((page) => page.status === 'published' || !page.status).length, color: '#10b981' },
    { name: 'Draft', value: mappedPages.filter((page) => page.status === 'draft').length, color: '#64748b' },
    { name: 'Scheduled', value: mappedPages.filter((page) => page.status === 'scheduled').length, color: '#3b82f6' }
  ].filter((item) => item.value > 0);

  return {
    summary: {
      totalPages: mappedPages.length,
      publishedPages: mappedPages.filter((page) => page.status === 'published' || !page.status).length,
      draftPages: mappedPages.filter((page) => page.status === 'draft').length,
      catalogTools: catalogToolCount,
      configuredTools: mappedSettings.length,
      enabledTools: effectiveEnabled,
      disabledTools,
      maintenanceTools,
      featuredTools,
      seoToolOverrides: seoToolCount,
      seoBlogOverrides: blogCount,
      mediaCount,
      cacheVersion,
      totalActivity: activityLog.length
    },
    activityByDay,
    activityByType,
    toolStatus,
    pageStatus,
    contentCoverage: [
      { name: 'Tool SEO', count: seoToolCount },
      { name: 'Blog CMS', count: blogCount },
      { name: 'Pages', count: mappedPages.length },
      { name: 'Media', count: mediaCount }
    ],
    recentActivity: activityLog.slice(0, 12).map((row) => ({
      id: row.id,
      action: row.action,
      details: row.details || {},
      createdAt: row.createdAt.toISOString()
    }))
  };
}

module.exports = {
  MEDIA_DIR,
  readContentStore,
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
  DEFAULT_NAVIGATION,
  wrapDbError
};
