const STORAGE_KEY = 'utility-tools-analytics';

function readAnalytics() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAnalytics(data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function trackToolUsage(slug) {
  if (!slug) return;
  const data = readAnalytics();
  data[slug] = (data[slug] || 0) + 1;
  data._lastUsed = { slug, at: Date.now() };
  writeAnalytics(data);
}

export function getPopularTools(limit = 8) {
  const data = readAnalytics();
  return Object.entries(data)
    .filter(([key]) => !key.startsWith('_'))
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([slug, count]) => ({ slug, count }));
}

export function trackSearchQuery(query) {
  if (!query?.trim()) return;
  const data = readAnalytics();
  const searches = data._searches || {};
  const key = query.trim().toLowerCase();
  searches[key] = (searches[key] || 0) + 1;
  data._searches = searches;
  writeAnalytics(data);
}
