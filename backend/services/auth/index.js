const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { pgPool, redisClient, connectRedis } = require('../../shared/database');
const { errorHandler, requestLogger } = require('../../shared/middleware');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth-service' });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

// Initialize connections and start server
const startServer = async () => {
  try {
    // Test PostgreSQL connection
    await pgPool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected');

    // Connect Redis
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`🚀 Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start Auth Service:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pgPool.end();
  await redisClient.quit();
  process.exit(0);
});
