const mongoose = require('mongoose');

// Legacy in-memory store retained only for backwards-compatible module imports.
// The application server never routes production requests to this store.
class MemoryStore {
  constructor() {
    this.collections = {
      users: [],
      clubs: [],
      events: [],
      memberships: [],
      collaborations: [],
      announcements: [],
      registrations: [],
    };
  }

  generateId() {
    return 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }
}

const memoryStore = new MemoryStore();

let cachedPromise = null;

const connectDB = async () => {
  // If already connected, return immediately (serverless connection reuse)
  if (mongoose.connection.readyState === 1) {
    global.databaseReady = true;
    return true;
  }

  // If a connection attempt is currently in-flight, await it
  if (cachedPromise) {
    try {
      await cachedPromise;
      global.databaseReady = mongoose.connection.readyState === 1;
      return global.databaseReady;
    } catch {
      cachedPromise = null;
    }
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('[MongoDB] MONGODB_URI is required. Database-backed routes are unavailable.');
    global.databaseReady = false;
    return false;
  }

  try {
    console.log('[MongoDB] Attempting connection to MongoDB...');
    cachedPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    await cachedPromise;
    console.log(`[MongoDB] Connected successfully to live MongoDB instance!`);
    global.databaseReady = true;
    global.usingMemoryDb = false;
    return true;
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    cachedPromise = null;
    global.databaseReady = false;
    return false;
  }
};

module.exports = { connectDB, memoryStore };
