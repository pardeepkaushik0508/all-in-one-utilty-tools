import { resolveApiUrl } from '../apiBase';

const DEFAULT_TOOL_SETTING = {
  enabled: true,
  featured: false,
  maintenanceMode: false,
  hiddenFromSearch: false,
  hiddenFromHomepage: false,
  hiddenFromNavigation: false,
  order: 9999,
  maintenanceMessage: 'This tool is temporarily unavailable for maintenance.'
};

export function normalizeToolSettings(settingsList = []) {
  const map = {};
  settingsList.forEach((item, index) => {
    map[item.slug] = { ...DEFAULT_TOOL_SETTING, ...item, order: item.order ?? index };
  });
  return map;
}

export function getToolSettingForSlug(settingsMap, slug) {
  return { ...DEFAULT_TOOL_SETTING, ...(settingsMap?.[slug] || {}) };
}

export function isToolVisibleInList(tool, settingsMap) {
  const setting = getToolSettingForSlug(settingsMap, tool.slug);
  return setting.enabled !== false;
}

export function isToolSearchable(tool, settingsMap) {
  const setting = getToolSettingForSlug(settingsMap, tool.slug);
  return setting.enabled !== false && setting.hiddenFromSearch !== true;
}

export function isToolOnHomepage(tool, settingsMap) {
  const setting = getToolSettingForSlug(settingsMap, tool.slug);
  return setting.enabled !== false && setting.hiddenFromHomepage !== true;
}

export function filterToolsForListing(tools, settingsMap, { homepage = false, search = false } = {}) {
  return tools.filter((tool) => {
    const setting = getToolSettingForSlug(settingsMap, tool.slug);
    if (setting.enabled === false) return false;
    if (homepage && setting.hiddenFromHomepage) return false;
    if (search && setting.hiddenFromSearch) return false;
    return true;
  }).sort((a, b) => {
    const orderA = getToolSettingForSlug(settingsMap, a.slug).order ?? 9999;
    const orderB = getToolSettingForSlug(settingsMap, b.slug).order ?? 9999;
    return orderA - orderB;
  });
}

export function getFeaturedTools(tools, settingsMap, limit = 8) {
  const featured = tools.filter((tool) => getToolSettingForSlug(settingsMap, tool.slug).featured);
  const pool = featured.length ? featured : tools.slice(0, limit);
  return filterToolsForListing(pool, settingsMap);
}

export async function fetchRemoteSiteConfig() {
  try {
    const response = await fetch(resolveApiUrl('/api/content/site'), {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function fetchRemotePage(slug) {
  try {
    const response = await fetch(resolveApiUrl(`/api/content/pages/${slug}`), {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.page || null;
  } catch {
    return null;
  }
}

export async function fetchRemoteToolSetting(slug) {
  try {
    const response = await fetch(resolveApiUrl(`/api/content/tools/settings/${slug}`), {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.setting || null;
  } catch {
    return null;
  }
}

export function mergePageSections(defaultSections = [], remoteSections = []) {
  if (!remoteSections.length) return defaultSections;
  const remoteMap = Object.fromEntries(remoteSections.map((section) => [section.id, section]));
  const merged = defaultSections.map((section) => ({
    ...section,
    ...(remoteMap[section.id] || {})
  }));
  remoteSections.forEach((section) => {
    if (!merged.find((item) => item.id === section.id)) merged.push(section);
  });
  return merged
    .filter((section) => section.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getSectionContent(page, sectionId, fallback = {}) {
  const section = (page?.sections || []).find((item) => item.id === sectionId);
  return { ...fallback, ...(section?.content || {}) };
}

export function isSectionEnabled(page, sectionId, defaultEnabled = true) {
  const section = (page?.sections || []).find((item) => item.id === sectionId);
  if (!section) return defaultEnabled;
  return section.enabled !== false;
}
