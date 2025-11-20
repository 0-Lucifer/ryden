const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { connectRedis, redisClient } = require('../../shared/database');
const { requestLogger, errorHandler, authenticateToken } = require('../../shared/middleware');
const locationRoutes = require('./routes/location.routes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req,res)=>res.json({status:'healthy', service:'location-service'}));
app.use('/api/location', authenticateToken, locationRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3004;
(async () => {
  try { await connectRedis(); app.listen(PORT, ()=> console.log(`🚀 Location Service running on ${PORT}`)); }
  catch(e){ console.error('Failed to start Location Service', e); process.exit(1);} })();
