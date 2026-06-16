import { tools } from '../utils/tools';
import { fetchRemoteBlogPosts } from '../utils/cms/blogPosts';
import { CATEGORY_SLUGS } from '../utils/suiteToolsRegistry';
import { getSiteUrl } from '../utils/siteUrl';

function generateSiteMap(siteUrl, blogPosts = []) {
  const categoryPaths = Object.values(CATEGORY_SLUGS).map((slug) => `/category/${slug}`);
  const staticPages = ['', '/about', '/contact', '/blog', ...categoryPaths];
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = staticPages
    .map(
      (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : '0.7'}</priority>
  </url>`
    )
    .join('\n');

  const toolUrls = tools
    .map(
      (tool) => `  <url>
    <loc>${siteUrl}/tool/${tool.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n');

  const blogUrls = blogPosts
    .map(
      (post) => `  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${post.date || today}</lastmod>
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

export async function getServerSideProps({ req, res }) {
  const siteUrl = getSiteUrl(req);
  const { posts } = await fetchRemoteBlogPosts({ limit: 500 });
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.write(generateSiteMap(siteUrl, posts));
  res.end();
  return { props: {} };
}

export default function SiteMap() {
  return null;
}
