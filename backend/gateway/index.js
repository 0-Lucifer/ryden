const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const jwt = require('jsonwebtoken');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

// JWT Authentication Middleware
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

// Simple proxy function
const proxyRequest = (targetUrl, req, res) => {
  console.log(`[PROXY] Forwarding ${req.method} ${req.originalUrl} to ${targetUrl}`);
  const parsedUrl = new URL(req.originalUrl.replace(/^\/api/, ''), targetUrl);
  
  const requestOptions = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 3001,
    path: parsedUrl.pathname + parsedUrl.search,
    method: req.method,
    headers: {
      ...req.headers,
      'host': parsedUrl.host,
    },
    timeout: 30000,
  };

  delete requestOptions.headers['content-length'];

  const protocol = parsedUrl.protocol === 'https:' ? https : http;
  
  const proxyReq = protocol.request(requestOptions, (proxyRes) => {
    console.log(`[PROXY] Response: ${proxyRes.statusCode}`);
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  });

  proxyReq.on('timeout', () => {
    console.error('Proxy timeout');
    proxyReq.abort();
    res.status(504).json({ error: 'Gateway timeout' });
  });

  req.pipe(proxyReq);
};

// Auth Service (Public routes)
app.use('/api/auth/', (req, res) => {
  proxyRequest(services.auth, req, res);
});

// User Service (Protected)
app.use('/api/users/', authenticate, (req, res) => {
  proxyRequest(services.user, req, res);
});

// Ride Service (Protected)
app.use('/api/rides/', authenticate, (req, res) => {
  proxyRequest(services.ride, req, res);
});

// Location Service (Protected)
app.use('/api/location/', authenticate, (req, res) => {
  proxyRequest(services.location, req, res);
});

// Payment Service (Protected)
app.use('/api/payments/', authenticate, (req, res) => {
  proxyRequest(services.payment, req, res);
});

// Notification Service (Protected)
app.use('/api/notifications/', authenticate, (req, res) => {
  proxyRequest(services.notification, req, res);
});

// Chat Service (Protected)
app.use('/api/chat/', authenticate, (req, res) => {
  proxyRequest(services.chat, req, res);
});

// Rating Service (Protected)
app.use('/api/ratings/', authenticate, (req, res) => {
  proxyRequest(services.rating, req, res);
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
  process.exit(1);
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
