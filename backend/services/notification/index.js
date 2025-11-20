const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { connectMongoDB } = require('../../shared/database');
const { requestLogger, errorHandler, authenticateToken } = require('../../shared/middleware');
const notificationRoutes = require('./routes/notification.routes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req,res)=>res.json({status:'healthy', service:'notification-service'}));
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3006;
(async () => { try { await connectMongoDB(); app.listen(PORT, ()=> console.log(`🚀 Notification Service running on ${PORT}`)); } catch(e){ console.error('Failed to start Notification Service', e); process.exit(1);} })();
