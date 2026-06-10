import { TEXT_SUITE_CONFIGS } from '../components/tools/configs/textSuiteConfig';
import { IMAGE_SUITE_CONFIGS } from '../components/tools/configs/imageSuiteConfig';

export const TEXT_CATEGORY_LINKS = [
  { slug: 'json-formatter', name: 'JSON Formatter', description: 'Format and validate JSON.' },
  { slug: 'html-to-text', name: 'HTML to Text', description: 'Extract readable plain text from HTML.' },
  { slug: 'hashtag-generator', name: 'Hashtag Generator', description: 'Generate hashtag sets for posts.' },
  { slug: 'password-generator', name: 'Password Generator', description: 'Create strong random passwords.' }
];

export function buildSuiteToolEntries(existingSlugs) {
  const textEntries = TEXT_SUITE_CONFIGS.map((config) => ({
    name: config.name,
    slug: config.slug,
    category: 'Text Tools',
    description: config.description
  }));

  const imageEntries = IMAGE_SUITE_CONFIGS.map((config) => ({
    name: config.name,
    slug: config.slug,
    category: 'Image Tools',
    description: config.description
  }));

  return [...textEntries, ...imageEntries].filter((tool) => !existingSlugs.has(tool.slug));
}

export function getCategoryTools(category, allTools) {
  const slugSet = new Set(allTools.filter((t) => t.category === category).map((t) => t.slug));
  const linked = category === 'Text Tools'
    ? TEXT_CATEGORY_LINKS.filter((t) => !slugSet.has(t.slug))
    : [];
  return [
    ...allTools.filter((t) => t.category === category),
    ...linked.map((t) => ({ ...t, category, linked: true }))
  ];
}
