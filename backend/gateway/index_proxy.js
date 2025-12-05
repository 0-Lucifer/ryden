const express = require('express');
const cors = require('cors');
const httpProxy = require('http-proxy');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[RESPONSE] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
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

// Create proxies for each service
const createServiceProxy = (serviceName, target) => {
  const proxy = httpProxy.createProxyServer({
    target: target,
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
  });

  proxy.on('error', (err, req, res) => {
    console.error(`[${serviceName}] Proxy error:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({ error: 'Service temporarily unavailable', details: err.message });
    }
  });

  proxy.on('proxyRes', (proxyRes, req, res) => {
    console.log(`[${serviceName}] Response received:`, proxyRes.statusCode);
    proxyRes.headers['X-Proxy-By'] = 'ryden-gateway';
  });

  proxy.on('proxyReq', (proxyReq, req, res) => {
    console.log(`[${serviceName}] Proxying to ${target}${req.url}`);
  });

  return proxy;
};

const authProxy = createServiceProxy('AUTH', services.auth);
const userProxy = createServiceProxy('USER', services.user);
const rideProxy = createServiceProxy('RIDE', services.ride);
const locationProxy = createServiceProxy('LOCATION', services.location);
const paymentProxy = createServiceProxy('PAYMENT', services.payment);
const notificationProxy = createServiceProxy('NOTIFICATION', services.notification);
const chatProxy = createServiceProxy('CHAT', services.chat);
const ratingProxy = createServiceProxy('RATING', services.rating);

// Auth Service (Public routes)
app.use('/api/auth', (req, res) => {
  console.log('[AUTH] Route handler called');
  authProxy.web(req, res, (err) => {
    if (err) console.error('[AUTH] Proxy web error:', err.message);
  });
});

// User Service (Protected)
app.use('/api/users', authenticate, (req, res) => {
  console.log('[USER] Route handler called');
  userProxy.web(req, res, (err) => {
    if (err) console.error('[USER] Proxy web error:', err.message);
  });
});

// Ride Service (Protected)
app.use('/api/rides', authenticate, (req, res) => {
  console.log('[RIDE] Route handler called');
  rideProxy.web(req, res, (err) => {
    if (err) console.error('[RIDE] Proxy web error:', err.message);
  });
});

// Location Service (Protected)
app.use('/api/location', authenticate, (req, res) => {
  console.log('[LOCATION] Route handler called');
  locationProxy.web(req, res, (err) => {
    if (err) console.error('[LOCATION] Proxy web error:', err.message);
  });
});

// Payment Service (Protected)
app.use('/api/payments', authenticate, (req, res) => {
  console.log('[PAYMENT] Route handler called');
  paymentProxy.web(req, res, (err) => {
    if (err) console.error('[PAYMENT] Proxy web error:', err.message);
  });
});

// Notification Service (Protected)
app.use('/api/notifications', authenticate, (req, res) => {
  console.log('[NOTIFICATION] Route handler called');
  notificationProxy.web(req, res, (err) => {
    if (err) console.error('[NOTIFICATION] Proxy web error:', err.message);
  });
});

// Chat Service (Protected)
app.use('/api/chat', authenticate, (req, res) => {
  console.log('[CHAT] Route handler called');
  chatProxy.web(req, res, (err) => {
    if (err) console.error('[CHAT] Proxy web error:', err.message);
  });
});

// Rating Service (Protected)
app.use('/api/ratings', authenticate, (req, res) => {
  console.log('[RATING] Route handler called');
  ratingProxy.web(req, res, (err) => {
    if (err) console.error('[RATING] Proxy web error:', err.message);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log('Service routes:');
  Object.entries(services).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
});
