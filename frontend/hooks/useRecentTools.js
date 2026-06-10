import { useEffect, useState } from 'react';

const STORAGE_KEY = 'utility-tools-recent';
const MAX_RECENT = 8;

export function addRecentTool(tool) {
  if (typeof window === 'undefined' || !tool?.slug) return;
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = existing.filter((t) => t.slug !== tool.slug);
    const next = [{ slug: tool.slug, name: tool.name, category: tool.category }, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export default function useRecentTools() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch {
      setRecent([]);
    }
  }, []);

  return recent;
}
