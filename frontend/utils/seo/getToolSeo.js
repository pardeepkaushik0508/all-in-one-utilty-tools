import { generateToolSeoContent } from './contentGenerator';

function deepMerge(base, override = {}) {
  if (!override || typeof override !== 'object') return base;
  const merged = { ...base, ...override };
  if (override.overview) merged.overview = override.overview;
  if (override.features) merged.features = override.features;
  if (override.howItWorks) merged.howItWorks = override.howItWorks;
  if (override.useCases) merged.useCases = override.useCases;
  if (override.benefits) merged.benefits = override.benefits;
  if (override.faqs) merged.faqs = override.faqs;
  if (override.keywords) merged.keywords = override.keywords;
  return merged;
}

export function getToolSeoContent(tool, remoteOverride = null) {
  if (!tool) return null;
  const generated = generateToolSeoContent(tool);
  const adminOverride = remoteOverride || {};
  return deepMerge(generated, adminOverride);
}

export async function fetchRemoteToolSeoOverride(slug) {
  const base =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://aio-tools-backend.onrender.com'
      : 'http://127.0.0.1:5000');

  try {
    const response = await fetch(`${base}/api/content/tools/${slug}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.content || null;
  } catch {
    return null;
  }
}

export default getToolSeoContent;
