const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { pgPool } = require('../../shared/database');
const { requestLogger, errorHandler, authenticateToken } = require('../../shared/middleware');
const ratingRoutes = require('./routes/rating.routes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req,res)=>res.json({status:'healthy', service:'rating-service'}));
app.use('/api/ratings', authenticateToken, ratingRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3008;
(async () => { try { await pgPool.query('SELECT 1'); app.listen(PORT, ()=> console.log(`🚀 Rating Service running on ${PORT}`)); } catch(e){ console.error('Failed to start Rating Service', e); process.exit(1);} })();
