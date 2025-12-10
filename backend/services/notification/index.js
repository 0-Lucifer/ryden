const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { requestLogger, errorHandler, authenticateToken } = require('../../shared/middleware');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://root:password@mongodb:27017/notification?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectMongoDB();

app.get('/health', (req,res)=>res.json({status:'healthy', service:'notification-service'}));

// Routes
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 Notification Service running on port ${PORT}`);
});

