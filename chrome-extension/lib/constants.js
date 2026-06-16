export const DEFAULT_SITE_URL = 'https://utilitytools.in';

export const CATEGORY_ORDER = [
  'PDF Tools',
  'Image Tools',
  'Video/Audio Tools',
  'Text Tools',
  'Developer Tools',
  'Social Media Tools',
  'Security Tools',
  'Utility Tools'
];

export const CATEGORY_META = {
  'PDF Tools': { emoji: '📄', color: '#ef4444' },
  'Image Tools': { emoji: '🖼️', color: '#8b5cf6' },
  'Video/Audio Tools': { emoji: '🎬', color: '#f59e0b' },
  'Text Tools': { emoji: '✍️', color: '#3b82f6' },
  'Developer Tools': { emoji: '💻', color: '#10b981' },
  'Social Media Tools': { emoji: '📱', color: '#ec4899' },
  'Security Tools': { emoji: '🔒', color: '#6366f1' },
  'Utility Tools': { emoji: '🔧', color: '#14b8a6' }
};

export const QUICK_TOOLS = [
  { slug: 'merge-pdf', name: 'Merge PDF' },
  { slug: 'compress-image', name: 'Compress Image' },
  { slug: 'json-formatter', name: 'JSON Formatter' },
  { slug: 'password-generator', name: 'Password Generator' },
  { slug: 'ai-content-generator', name: 'AI Content' },
  { slug: 'grammar-checker', name: 'Grammar Check' }
];

export const STORAGE_KEYS = {
  siteUrl: 'siteUrl',
  theme: 'theme',
  favorites: 'favorites',
  recent: 'recent',
  openInNewTab: 'openInNewTab'
};
