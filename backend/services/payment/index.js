const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { pgPool } = require('../../shared/database');
const { requestLogger, errorHandler, authenticateToken } = require('../../shared/middleware');
const paymentRoutes = require('./routes/payment.routes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req,res)=>res.json({status:'healthy', service:'payment-service'}));
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3005;
(async () => { try { await pgPool.query('SELECT 1'); app.listen(PORT, ()=> console.log(`🚀 Payment Service running on ${PORT}`)); } catch(e){ console.error('Failed to start Payment Service', e); process.exit(1);} })();
