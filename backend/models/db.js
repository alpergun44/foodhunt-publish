/**
 * FoodHunt — Database Abstraction Layer
 *
 * Provides a unified interface that works with both NeDB (development)
 * and MongoDB (production). Switch via DB_TYPE env variable.
 *
 * DB_TYPE=nedb  -> uses nedb-promises (default, zero config)
 * DB_TYPE=mongo -> uses mongodb native driver
 */
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const DB_TYPE = process.env.DB_TYPE || 'nedb';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/foodhunt';

let db = {};
let _mongoClient = null;

async function initNeDB() {
  const Datastore = require('nedb-promises');
  const DB_DIR = path.join(__dirname, '..', 'db');
  fs.mkdirSync(DB_DIR, { recursive: true });

  db.restaurants = Datastore.create({ filename: path.join(DB_DIR, 'restaurants.db'), autoload: true });
  db.events = Datastore.create({ filename: path.join(DB_DIR, 'events.db'), autoload: true });
  db.cards = Datastore.create({ filename: path.join(DB_DIR, 'cards.db'), autoload: true });
  db.users = Datastore.create({ filename: path.join(DB_DIR, 'users.db'), autoload: true });
  db.favorites = Datastore.create({ filename: path.join(DB_DIR, 'favorites.db'), autoload: true });
  db.history = Datastore.create({ filename: path.join(DB_DIR, 'history.db'), autoload: true });

  // Indexes
  await db.restaurants.ensureIndex({ fieldName: 'id', unique: true });
  await db.restaurants.ensureIndex({ fieldName: 'area' });
  await db.restaurants.ensureIndex({ fieldName: 'cuisine' });
  await db.restaurants.ensureIndex({ fieldName: 'is_active' });
  await db.events.ensureIndex({ fieldName: 'created_at' });
  await db.events.ensureIndex({ fieldName: 'event_type' });
  await db.users.ensureIndex({ fieldName: 'email', unique: true });
  await db.favorites.ensureIndex({ fieldName: 'user_id' });
  await db.history.ensureIndex({ fieldName: 'user_id' });

  logger.info('NeDB initialized', { collections: Object.keys(db).length });
}

async function initMongoDB() {
  const { MongoClient } = require('mongodb');
  _mongoClient = new MongoClient(MONGO_URI);
  await _mongoClient.connect();
  const database = _mongoClient.db();

  db.restaurants = database.collection('restaurants');
  db.events = database.collection('events');
  db.cards = database.collection('cards');
  db.users = database.collection('users');
  db.favorites = database.collection('favorites');
  db.history = database.collection('history');

  // MongoDB indexes
  await db.restaurants.createIndex({ id: 1 }, { unique: true });
  await db.restaurants.createIndex({ area: 1 });
  await db.restaurants.createIndex({ cuisine: 1 });
  await db.restaurants.createIndex({ is_active: 1 });
  await db.events.createIndex({ created_at: -1 });
  await db.events.createIndex({ event_type: 1 });
  await db.users.createIndex({ email: 1 }, { unique: true });
  await db.favorites.createIndex({ user_id: 1 });
  await db.history.createIndex({ user_id: 1, created_at: -1 });

  logger.info('MongoDB connected', { uri: MONGO_URI.replace(/\/\/.*@/, '//***@') });
}

async function initDB() {
  if (DB_TYPE === 'mongo') {
    await initMongoDB();
  } else {
    await initNeDB();
  }
  return db;
}

async function closeDB() {
  if (_mongoClient) {
    await _mongoClient.close();
    logger.info('MongoDB connection closed');
  }
}

// Unified query helpers (NeDB and MongoDB have slightly different APIs)
const dbHelpers = {
  async find(collection, query = {}, options = {}) {
    if (DB_TYPE === 'mongo') {
      let cursor = db[collection].find(query);
      if (options.sort) cursor = cursor.sort(options.sort);
      if (options.limit) cursor = cursor.limit(options.limit);
      if (options.skip) cursor = cursor.skip(options.skip);
      return cursor.toArray();
    }
    let q = db[collection].find(query);
    if (options.sort) q = q.sort(options.sort);
    if (options.limit) q = q.limit(options.limit);
    if (options.skip) q = q.skip(options.skip);
    return q;
  },

  async findOne(collection, query) {
    return db[collection].findOne(query);
  },

  async insert(collection, doc) {
    if (DB_TYPE === 'mongo') {
      const result = await db[collection].insertOne(doc);
      return { ...doc, _id: result.insertedId };
    }
    return db[collection].insert(doc);
  },

  async update(collection, query, update) {
    if (DB_TYPE === 'mongo') {
      return db[collection].updateOne(query, { $set: update.$set || update });
    }
    return db[collection].update(query, { $set: update.$set || update });
  },

  async remove(collection, query) {
    if (DB_TYPE === 'mongo') {
      return db[collection].deleteOne(query);
    }
    return db[collection].remove(query, {});
  },

  async count(collection, query = {}) {
    if (DB_TYPE === 'mongo') {
      return db[collection].countDocuments(query);
    }
    return db[collection].count(query);
  },
};

module.exports = { initDB, closeDB, db, dbHelpers, DB_TYPE };
