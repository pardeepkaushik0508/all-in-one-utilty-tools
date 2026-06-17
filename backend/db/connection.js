const mongoose = require('mongoose');

let connectionPromise = null;

function getMongoUri() {
  return process.env.DATABASE_URL || process.env.MONGODB_URI || '';
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

async function connectDb() {
  if (isDbConnected()) return mongoose.connection;

  if (connectionPromise) return connectionPromise;

  const uri = getMongoUri();
  if (!uri) {
    throw new Error('DATABASE_URL is not set. Add your MongoDB connection string to the backend environment.');
  }

  mongoose.set('strictQuery', true);

  connectionPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10
    })
    .then(() => {
      console.log('[db] MongoDB connected');
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error('[db] MongoDB connection failed:', error.message);
      throw error;
    });

  return connectionPromise;
}

async function disconnectDb() {
  connectionPromise = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

async function pingDb() {
  if (!isDbConnected()) {
    await connectDb();
  }
  await mongoose.connection.db.admin().ping();
  return true;
}

module.exports = {
  mongoose,
  connectDb,
  disconnectDb,
  isDbConnected,
  pingDb,
  getMongoUri
};
