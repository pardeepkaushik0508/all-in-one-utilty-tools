import { CATEGORY_ORDER } from './constants.js';

let cache = null;

export async function loadTools() {
  if (cache) return cache;
  const response = await fetch(chrome.runtime.getURL('tools.json'));
  const tools = await response.json();
  cache = tools.map((tool) => ({
    ...tool,
    url: null
  }));
  return cache;
}

export function buildToolUrl(siteUrl, slug) {
  return `${siteUrl.replace(/\/$/, '')}/tool/${slug}`;
}

export function groupByCategory(tools) {
  const groups = {};
  tools.forEach((tool) => {
    const cat = tool.category || 'Other';
    groups[cat] = groups[cat] || [];
    groups[cat].push(tool);
  });
  return CATEGORY_ORDER.filter((cat) => groups[cat]?.length).map((cat) => ({
    category: cat,
    tools: groups[cat].sort((a, b) => a.name.localeCompare(b.name))
  }));
}

export function filterTools(tools, { query = '', category = '' } = {}) {
  const q = query.trim().toLowerCase();
  return tools.filter((tool) => {
    if (category && tool.category !== category) return false;
    if (!q) return true;
    const haystack = `${tool.name} ${tool.description} ${tool.category} ${tool.slug}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function getCategories(tools) {
  const set = new Set(tools.map((t) => t.category).filter(Boolean));
  return CATEGORY_ORDER.filter((c) => set.has(c));
}
