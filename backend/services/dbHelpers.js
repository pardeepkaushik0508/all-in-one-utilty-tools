const { connectDb } = require('../db/connection');
const { SiteMeta } = require('../db/models');
const { createId, nowIso, slugify } = require('../utils/ids');

function isDbUnavailable(error) {
  const name = String(error?.name || '');
  const code = String(error?.code || '');
  return (
    ['MongoServerSelectionError', 'MongoNetworkError', 'MongooseServerSelectionError'].includes(name) ||
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND'
  );
}

function isDuplicateKeyError(error) {
  return error?.code === 11000;
}

function isNotFoundError(error) {
  return error?.status === 404;
}

function wrapDbError(error, message = 'Database operation failed.') {
  const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
  if (!uri) {
    return Object.assign(
      new Error('DATABASE_URL is not set on the server. Add your MongoDB connection string to the backend environment.'),
      { status: 503 }
    );
  }
  if (isDbUnavailable(error)) {
    return Object.assign(
      new Error('Database connection failed. Check DATABASE_URL (MongoDB URI) in your backend environment variables.'),
      { status: 503 }
    );
  }
  if (error?.status) return error;
  const detail = error?.message && !String(error.message).includes('mongoose')
    ? `: ${error.message}`
    : '';
  return Object.assign(new Error(`${message}${detail}`), { status: 500, cause: error });
}

async function ensureDb() {
  await connectDb();
}

async function getSiteMeta(key, fallback = null) {
  await ensureDb();
  const row = await SiteMeta.findOne({ key }).lean();
  return row ? row.value : fallback;
}

async function setSiteMeta(key, value) {
  await ensureDb();
  return SiteMeta.findOneAndUpdate(
    { key },
    { $set: { _id: key, key, value } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
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
  isDuplicateKeyError,
  isNotFoundError,
  wrapDbError,
  ensureDb,
  getSiteMeta,
  setSiteMeta,
  bumpCacheVersion,
  getCacheVersionValue
};
