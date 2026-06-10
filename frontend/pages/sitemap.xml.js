import { tools } from '../utils/tools';
import { blogPosts } from '../utils/blogPosts';
import { SITE_URL } from '../components/SEO';

function generateSiteMap() {
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/blog',
    '/category/text-tools',
    '/category/image-tools',
    '/category/developer-tools',
    '/category/security-tools',
    '/category/utility-tools',
    '/category/social-media-tools'
  ];
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = staticPages
    .map(
      (path) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : '0.7'}</priority>
  </url>`
    )
    .join('\n');

  const toolUrls = tools
    .map(
      (tool) => `  <url>
    <loc>${SITE_URL}/tool/${tool.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n');

  const blogUrls = blogPosts
    .map(
      (post) => `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${toolUrls}
${blogUrls}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/xml');
  res.write(generateSiteMap());
  res.end();
  return { props: {} };
}

export default function SiteMap() {
  return null;
}
