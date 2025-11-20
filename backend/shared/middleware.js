const jwt = require('jsonwebtoken');

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
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

// Role-based Authorization Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Request Logger Middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });
  next();
};

// Rate Limiting (using Redis)
const rateLimit = (redisClient, maxRequests = 1000, windowMs = 60000) => {
  return async (req, res, next) => {
    const key = `rate_limit:${req.ip}`;

    try {
      const current = await redisClient.incr(key);
      
      if (current === 1) {
        await redisClient.expire(key, Math.floor(windowMs / 1000));
      }

      if (current > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests, please try again later',
        });
      }

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      
      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  };
};

module.exports = {
  authenticateToken,
  authorize,
  errorHandler,
  requestLogger,
  rateLimit,
};
