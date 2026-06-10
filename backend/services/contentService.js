const fs = require('fs/promises');
const path = require('path');

const CONTENT_FILE = path.join(__dirname, '../data/seo-content.json');

async function ensureContentFile() {
  try {
    await fs.access(CONTENT_FILE);
  } catch {
    await fs.mkdir(path.dirname(CONTENT_FILE), { recursive: true });
    await fs.writeFile(CONTENT_FILE, JSON.stringify({ tools: {}, blogs: {} }, null, 2));
  }
}

async function readContentStore() {
  await ensureContentFile();
  const raw = await fs.readFile(CONTENT_FILE, 'utf8');
  return JSON.parse(raw || '{"tools":{},"blogs":{}}');
}

async function writeContentStore(data) {
  await ensureContentFile();
  await fs.writeFile(CONTENT_FILE, JSON.stringify(data, null, 2));
  return data;
}

async function getToolContent(slug) {
  const store = await readContentStore();
  return store.tools?.[slug] || null;
}

async function saveToolContent(slug, payload) {
  const store = await readContentStore();
  store.tools = store.tools || {};
  store.tools[slug] = {
    ...store.tools[slug],
    ...payload,
    updatedAt: new Date().toISOString()
  };
  await writeContentStore(store);
  return store.tools[slug];
}

async function getBlogContent(slug) {
  const store = await readContentStore();
  return store.blogs?.[slug] || null;
}

async function saveBlogContent(slug, payload) {
  const store = await readContentStore();
  store.blogs = store.blogs || {};
  store.blogs[slug] = {
    ...store.blogs[slug],
    ...payload,
    updatedAt: new Date().toISOString()
  };
  await writeContentStore(store);
  return store.blogs[slug];
}

async function listContentSummary() {
  const store = await readContentStore();
  return {
    tools: Object.keys(store.tools || {}),
    blogs: Object.keys(store.blogs || {})
  };
}

module.exports = {
  readContentStore,
  getToolContent,
  saveToolContent,
  getBlogContent,
  saveBlogContent,
  listContentSummary
};
