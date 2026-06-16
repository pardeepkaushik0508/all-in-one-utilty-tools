const crypto = require('crypto');
const { getPrisma } = require('../prisma/client');

function createId(prefix = 'id') {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

function nowIso() {
  return new Date().toISOString();
}

function slugify(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isDbUnavailable(error) {
  const code = String(error?.code || '');
  return ['P1001', 'P1002', 'P1003', 'P1008', 'P1017', 'P2024'].includes(code);
}

function wrapDbError(error, message = 'Database operation failed.') {
  if (!process.env.DATABASE_URL) {
    return Object.assign(
      new Error('DATABASE_URL is not set on the server. Add your PostgreSQL connection string to the backend environment.'),
      { status: 503 }
    );
  }
  if (isDbUnavailable(error)) {
    return Object.assign(
      new Error(
        'Database connection failed. Check DATABASE_URL on the Render backend service (use the internal DB URL from the Render Postgres dashboard).'
      ),
      { status: 503 }
    );
  }
  if (error?.status) return error;
  const detail = error?.message && !String(error.message).includes('prisma')
    ? `: ${error.message}`
    : '';
  return Object.assign(new Error(`${message}${detail}`), { status: 500, cause: error });
}

async function getSiteMeta(key, fallback = null) {
  const prisma = getPrisma();
  const row = await prisma.siteMeta.findUnique({ where: { key } });
  return row ? row.value : fallback;
}

async function setSiteMeta(key, value) {
  const prisma = getPrisma();
  return prisma.siteMeta.upsert({
    where: { key },
    create: { key, value, updatedAt: new Date() },
    update: { value, updatedAt: new Date() }
  });
}

async function bumpCacheVersion() {
  const current = Number(await getSiteMeta('cacheVersion', 1)) || 1;
  const next = current + 1;
  await setSiteMeta('cacheVersion', next);
  return next;
}

async function getCacheVersionValue() {
  return Number(await getSiteMeta('cacheVersion', 1)) || 1;
}

module.exports = {
  createId,
  nowIso,
  slugify,
  isDbUnavailable,
  wrapDbError,
  getSiteMeta,
  setSiteMeta,
  bumpCacheVersion,
  getCacheVersionValue
};
