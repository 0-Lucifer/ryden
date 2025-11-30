const { Pool } = require('pg');
let mongoose;
let redis;

// Try to require optional dependencies
try {
  mongoose = require('mongoose');
} catch (e) {
  // Mongoose not installed - service doesn't use MongoDB
}

try {
  redis = require('redis');
} catch (e) {
  // Redis not installed - service doesn't use Redis
}

// PostgreSQL Connection Pool
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pgPool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// MongoDB Connection
const connectMongoDB = async () => {
  if (!mongoose) {
    console.warn('⚠️  Mongoose not available');
    return null;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(-1);
  }
};

// Redis Connection
let redisClient = null;
if (redis) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          return new Error('Redis reconnection attempts exceeded');
        }
        return retries * 500;
      },
    },
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });
}

const connectRedis = async () => {
  if (!redisClient) {
    console.warn('⚠️  Redis not available');
    return null;
  }
  await redisClient.connect();
};

module.exports = {
  pgPool,
  mongoose,
  connectMongoDB,
  redisClient,
  connectRedis,
};
