#!/usr/bin/env node
/**
 * One-time helper: extracts static blog posts from frontend/utils/blogPosts.js
 * Run: node scripts/extract-blog-seed.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const srcPath = path.join(__dirname, '../../frontend/utils/blogPosts.js');
const src = fs.readFileSync(srcPath, 'utf8');

const sandbox = {
  exports: {},
  module: { exports: {} }
};
sandbox.module.exports = sandbox.exports;

const script = src
  .replace(/^export /gm, '')
  .replace(/export const /g, 'const ')
  .replace(/export function /g, 'function ');

vm.runInNewContext(`${script}\nmodule.exports = { blogPosts, blogCategories };`, sandbox);

const posts = sandbox.module.exports.blogPosts.map((post) => ({
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  category: post.category,
  date: post.date,
  readTime: post.readTime,
  relatedToolSlug: post.relatedToolSlug,
  author: post.author,
  content: Array.isArray(post.content)
    ? post.content.map((para) => `<p>${para}</p>`).join('\n')
    : post.content,
  status: 'published'
}));

const outDir = path.join(__dirname, '../db/seed-data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'static-blogs.json'), JSON.stringify(posts, null, 2));
console.log(`Wrote ${posts.length} posts to db/seed-data/static-blogs.json`);
