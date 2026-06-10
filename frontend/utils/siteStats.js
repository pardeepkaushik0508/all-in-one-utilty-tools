import { toolCategories, tools } from './tools';
import { CATEGORY_SLUGS } from './suiteToolsRegistry';

export const TOOL_COUNT = tools.length;
export const CATEGORY_COUNT = toolCategories.length;

export function getToolCountLabel() {
  return `${TOOL_COUNT}+`;
}

export function getCategoryHref(category) {
  const slug = CATEGORY_SLUGS[category];
  return slug ? `/category/${slug}` : '/#tools';
}

export function getToolsCountByCategory() {
  return Object.fromEntries(
    toolCategories.map((category) => [
      category,
      tools.filter((tool) => tool.category === category).length
    ])
  );
}

export function getTopToolsByCategory(category, limit = 4) {
  return tools.filter((tool) => tool.category === category).slice(0, limit);
}
