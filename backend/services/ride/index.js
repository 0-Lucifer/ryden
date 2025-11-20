const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { pgPool, connectRedis, redisClient } = require('../../shared/database');
const { requestLogger, errorHandler, authenticateToken } = require('../../shared/middleware');
const rideRoutes = require('./routes/ride.routes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req,res)=>res.json({status:'healthy', service:'ride-service'}));
app.use('/api/rides', authenticateToken, rideRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3003;
(async () => {
  try {
    await pgPool.query('SELECT 1');
    await connectRedis();
    app.listen(PORT, () => console.log(`🚀 Ride Service running on ${PORT}`));
  } catch (e) { console.error('Failed to start Ride Service', e); process.exit(1); }
})();
