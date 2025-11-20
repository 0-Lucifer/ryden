const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { pgPool, connectRedis, redisClient } = require('../../shared/database');
const { requestLogger, errorHandler, authenticateToken } = require('../../shared/middleware');
const userRoutes = require('./routes/user.routes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'user-service' }));
app.use('/api/users', authenticateToken, userRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3002;
(async () => {
  try {
    await pgPool.query('SELECT 1');
    await connectRedis();
    app.listen(PORT, () => console.log(`🚀 User Service running on ${PORT}`));
  } catch (e) {
    console.error('Failed to start User Service', e); process.exit(1);
  }
})();
