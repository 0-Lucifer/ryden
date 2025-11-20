const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  message: 'Too many requests from this IP, please try again later',
});
app.use(limiter);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// JWT Authentication Middleware (for protected routes)
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'api-gateway',
    timestamp: new Date().toISOString() 
  });
});

// Service URLs
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  user: process.env.USER_SERVICE_URL || 'http://user-service:3002',
  ride: process.env.RIDE_SERVICE_URL || 'http://ride-service:3003',
  location: process.env.LOCATION_SERVICE_URL || 'http://location-service:3004',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3005',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006',
  chat: process.env.CHAT_SERVICE_URL || 'http://chat-service:3007',
  rating: process.env.RATING_SERVICE_URL || 'http://rating-service:3008',
};

// Proxy configuration
const proxyOptions = {
  changeOrigin: true,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  },
};

// Auth Service (Public routes)
app.use(
  '/api/auth',
  createProxyMiddleware({
    ...proxyOptions,
    target: services.auth,
    pathRewrite: { '^/api/auth': '/api/auth' },
  })
);

// User Service (Protected)
app.use(
  '/api/users',
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: services.user,
    pathRewrite: { '^/api/users': '/api/users' },
  })
);

// Ride Service (Protected)
app.use(
  '/api/rides',
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: services.ride,
    pathRewrite: { '^/api/rides': '/api/rides' },
  })
);

// Location Service (Protected)
app.use(
  '/api/location',
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: services.location,
    pathRewrite: { '^/api/location': '/api/location' },
  })
);

// Payment Service (Protected)
app.use(
  '/api/payments',
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: services.payment,
    pathRewrite: { '^/api/payments': '/api/payments' },
  })
);

// Notification Service (Protected)
app.use(
  '/api/notifications',
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: services.notification,
    pathRewrite: { '^/api/notifications': '/api/notifications' },
  })
);

// Chat Service (Protected)
app.use(
  '/api/chat',
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: services.chat,
    pathRewrite: { '^/api/chat': '/api/chat' },
  })
);

// Rating Service (Protected)
app.use(
  '/api/ratings',
  authenticate,
  createProxyMiddleware({
    ...proxyOptions,
    target: services.rating,
    pathRewrite: { '^/api/ratings': '/api/ratings' },
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log('Service routes:');
  Object.entries(services).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
});
