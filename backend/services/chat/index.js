const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const http = require('http');
const jwt = require('jsonwebtoken');
const { connectMongoDB } = require('../../shared/database');
const { requestLogger, errorHandler, authenticateToken } = require('../../shared/middleware');
const chatRoutes = require('./routes/chat.routes');
const mongoose = require('mongoose');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req,res)=>res.json({status:'healthy', service:'chat-service'}));
app.use('/api/chat', authenticateToken, chatRoutes);
app.use(errorHandler);

// Mongo schema
const messageSchema = new mongoose.Schema({
  rideId:String,
  fromUserId:String,
  toUserId:String,
  content:String,
  createdAt:{ type:Date, default:Date.now }
},{ indexes:[{ expireAfterSeconds: 86400, key:{ createdAt:1 }}] });
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors:{ origin:'*' } });

io.use((socket,next)=>{
  const token = socket.handshake.auth?.token;
  if(!token) return next(new Error('No token'));
  try { const user = jwt.verify(token, process.env.JWT_SECRET); socket.user = user; next(); } catch(e){ next(new Error('Invalid token')); }
});

io.on('connection', (socket)=>{
  socket.on('joinRide', (rideId)=>{ socket.join('ride:'+rideId); });
  socket.on('message', async ({ rideId, toUserId, content })=>{
    const doc = await Message.create({ rideId, fromUserId: socket.user.id, toUserId, content });
    io.to('ride:'+rideId).emit('message', { id:doc._id, rideId, fromUserId:socket.user.id, toUserId, content, createdAt:doc.createdAt });
  });
});

const PORT = process.env.PORT || 3007;
(async () => { try { await connectMongoDB(); server.listen(PORT, ()=> console.log(`🚀 Chat Service running on ${PORT}`)); } catch(e){ console.error('Failed to start Chat Service', e); process.exit(1);} })();
