import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

function resetCache() {
  cached.promise = null;
  cached.conn = null;
}

function attachConnectionHandlers() {
  const conn = mongoose.connection;
  if (conn.listenerCount('error') > 0) return;
  conn.on('error', (err) => {
    console.error('[MongoDB] connection error:', err?.message || err);
  });
  conn.on('disconnected', () => {
    resetCache();
  });
}

const mongooseOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 20000,
  maxIdleTimeMS: 60000,
  heartbeatFrequencyMS: 10000,
  family: 4,
  retryWrites: true,
  retryReads: true,
};

function isTransientMongoError(err) {
  const code = err?.code;
  const name = err?.name;
  return (
    name === 'MongoNetworkError' ||
    name === 'MongoServerSelectionError' ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    err?.message?.includes('ECONNRESET')
  );
}

async function connectOnce() {
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, mongooseOptions)
      .then((m) => {
        attachConnectionHandlers();
        return m;
      })
      .catch((error) => {
        resetCache();
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    resetCache();
    throw e;
  }

  return cached.conn;
}

async function dbConnect() {
  try {
    return await connectOnce();
  } catch (err) {
    if (isTransientMongoError(err)) {
      resetCache();
      return await connectOnce();
    }
    throw err;
  }
}

/** Réessaie une opération Mongo après erreur réseau (ECONNRESET, etc.) */
export async function runWithMongoRetry(fn, maxAttempts = 2) {
  let lastErr;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await dbConnect();
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < maxAttempts - 1 && isTransientMongoError(e)) {
        resetCache();
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

export default dbConnect;
