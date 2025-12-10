const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const jwt = require('jsonwebtoken');
const url = require('url');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
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

// Socket.IO Authentication Middleware
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new Error('Invalid or expired token'));
    }
    socket.user = user;
    next();
  });
};

// Socket.IO Connection and Event Handlers
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`[WebSocket] User ${socket.user.id} connected`);

  // Join ride room
  socket.on('join_ride', (data, callback) => {
    const { rideId } = data;
    socket.join(`ride_${rideId}`);
    console.log(`[WebSocket] User ${socket.user.id} joined ride room: ${rideId}`);

    // Confirm room join with callback
    if (callback) {
      callback({ success: true, room: `ride_${rideId}` });
    }

    // Notify others in the room that a new user joined
    socket.to(`ride_${rideId}`).emit('user_joined_ride', {
      rideId,
      userId: socket.user.id,
      timestamp: new Date().toISOString()
    });
  });

  // Leave ride room
  socket.on('leave_ride', (data, callback) => {
    const { rideId } = data;
    socket.leave(`ride_${rideId}`);
    console.log(`[WebSocket] User ${socket.user.id} left ride room: ${rideId}`);

    // Confirm room leave with callback
    if (callback) {
      callback({ success: true, room: `ride_${rideId}` });
    }

    // Notify others in the room that a user left
    socket.to(`ride_${rideId}`).emit('user_left_ride', {
      rideId,
      userId: socket.user.id,
      timestamp: new Date().toISOString()
    });
  });

  // Location update from driver
  socket.on('location_update', (data) => {
    const { rideId, latitude, longitude, heading, speed, timestamp } = data;

    // Check if socket is in the room before broadcasting
    const roomName = `ride_${rideId}`;
    const room = io.sockets.adapter.rooms.get(roomName);

    if (room && room.has(socket.id)) {
      // Broadcast to all users in the ride room except sender
      socket.to(roomName).emit('driver_location', {
        rideId,
        latitude,
        longitude,
        heading,
        speed,
        timestamp
      });
      console.log(`[WebSocket] Location update broadcasted for ride ${rideId} to ${room.size - 1} clients`);
    } else {
      console.log(`[WebSocket] Location update ignored - socket not in room ${rideId}`);
    }
  });

  // Send chat message
  socket.on('send_message', (data) => {
    const { rideId, receiverId, message, timestamp } = data;
    const messageData = {
      id: Date.now().toString(),
      rideId,
      senderId: socket.user.id,
      receiverId,
      message,
      timestamp,
      read: false
    };

    // Check if socket is in the room before broadcasting
    const roomName = `ride_${rideId}`;
    const room = io.sockets.adapter.rooms.get(roomName);

    if (room && room.has(socket.id)) {
      // Send to all clients in the ride room (including sender for consistency)
      io.to(roomName).emit('new_message', messageData);
      console.log(`[WebSocket] Message broadcasted in ride ${rideId} to ${room.size} clients`);
    } else {
      console.log(`[WebSocket] Message ignored - socket not in room ${rideId}`);
    }
  });

  // Mark messages as read
  socket.on('mark_read', (data) => {
    const { rideId } = data;
    // This would typically update the database
    console.log(`[WebSocket] Messages marked as read for ride ${rideId}`);

    // Notify others that messages were read
    socket.to(`ride_${rideId}`).emit('messages_read', {
      rideId,
      userId: socket.user.id,
      timestamp: new Date().toISOString()
    });
  });

  // Ride status change (broadcast to ride room)
  socket.on('ride_status_changed', (data) => {
    const { rideId, status } = data;

    // Check if socket is in the room before broadcasting
    const roomName = `ride_${rideId}`;
    const room = io.sockets.adapter.rooms.get(roomName);

    if (room && room.has(socket.id)) {
      // Broadcast to all users in the ride room
      io.to(roomName).emit('ride_status_changed', { rideId, status });
      console.log(`[WebSocket] Ride ${rideId} status changed to ${status} - broadcasted to ${room.size} clients`);
    } else {
      console.log(`[WebSocket] Status change ignored - socket not in room ${rideId}`);
    }
  });

  // Ride matched event
  socket.on('ride_matched', (data) => {
    const { rideId } = data;

    // Check if socket is in the room before broadcasting
    const roomName = `ride_${rideId}`;
    const room = io.sockets.adapter.rooms.get(roomName);

    if (room && room.has(socket.id)) {
      // Broadcast to all users in the ride room
      io.to(roomName).emit('ride_matched', { rideId });
      console.log(`[WebSocket] Ride ${rideId} matched - broadcasted to ${room.size} clients`);
    } else {
      console.log(`[WebSocket] Ride matched event ignored - socket not in room ${rideId}`);
    }
  });

  // Driver arriving
  socket.on('driver_arriving', (data) => {
    const { rideId, eta } = data;

    // Check if socket is in the room before broadcasting
    const roomName = `ride_${rideId}`;
    const room = io.sockets.adapter.rooms.get(roomName);

    if (room && room.has(socket.id)) {
      // Broadcast to all users in the ride room except sender
      socket.to(roomName).emit('driver_arriving', { rideId, eta });
      console.log(`[WebSocket] Driver arriving for ride ${rideId}, ETA: ${eta} min - broadcasted to ${room.size - 1} clients`);
    } else {
      console.log(`[WebSocket] Driver arriving event ignored - socket not in room ${rideId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] User ${socket.user.id} disconnected`);
  });
});

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
// `options.stripApi` - if true, strip leading `/api` from the forwarded path
const proxyRequest = (targetUrl, req, res, options = {}) => {
  console.log(`[PROXY] Forwarding ${req.method} ${req.originalUrl} to ${targetUrl}`);
  const stripApi = !!options.stripApi;
  // If a caller requests stripping `/api` (used for auth-service which mounts '/auth'),
  // remove it; otherwise forward the full original URL.
  const forwardedPath = stripApi ? req.originalUrl.replace(/^\/api/, '') : req.originalUrl;
  const parsedUrl = new URL(forwardedPath, targetUrl);
  
  let body = null;
  if (req.body) {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

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

  // Set content-length if there's a body
  if (body) {
    requestOptions.headers['content-length'] = Buffer.byteLength(body);
  } else {
    delete requestOptions.headers['content-length'];
  }

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

  // Write body if present, otherwise pipe the stream
  if (body) {
    proxyReq.write(body);
    proxyReq.end();
  } else {
    req.pipe(proxyReq);
  }
};

// Auth Service (Public routes)
app.use('/api/auth/', (req, res) => {
  // Auth service mounts at '/auth' (no /api prefix), so strip /api when forwarding
  proxyRequest(services.auth, req, res, { stripApi: true });
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

server.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log('Service routes:');
  Object.entries(services).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
})
