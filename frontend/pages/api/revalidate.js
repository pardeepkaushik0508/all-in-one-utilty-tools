export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const secret = process.env.REVALIDATE_SECRET || process.env.ADMIN_TOKEN;
  const { secret: bodySecret, paths = [] } = req.body || {};

  if (!secret || bodySecret !== secret) {
    return res.status(401).json({ error: 'Invalid revalidation secret.' });
  }

  const targets = Array.isArray(paths) && paths.length ? paths : ['/', '/about', '/contact'];
  const results = [];

  for (const path of targets) {
    try {
      await res.revalidate(path);
      results.push({ path, revalidated: true });
    } catch (error) {
      results.push({ path, revalidated: false, error: error.message });
    }
  }

  return res.json({ revalidated: true, results });
}
