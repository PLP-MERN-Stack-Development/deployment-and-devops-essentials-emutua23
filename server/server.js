import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { MonitoringService, requestTrackingMiddleware, trackError } from './monitoring.js';

dotenv.config();

// Initialize monitoring
const monitoring = new MonitoringService();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// ✅ Dynamic CORS configuration – allows GitHub Pages and Vercel preview URLs
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://plp-mern-stack-development.github.io',
  'https://real-time-communication-with-socket-one.vercel.app'
];

const dynamicOriginCheck = (origin, callback) => {
  // Allow server-to-server or non-browser requests
  if (!origin) return callback(null, true);

  // Allow main site + all Vercel preview deployments + GitHub Pages
  if (
    allowedOrigins.includes(origin) ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.github.io')
  ) {
    console.log('✅ CORS allowed for:', origin);
    callback(null, true);
  } else {
    console.warn('❌ CORS blocked for:', origin);
    callback(new Error('Not allowed by CORS'));
  }
};

// ✅ Apply CORS to Express
app.use(cors({
  origin: dynamicOriginCheck,
  credentials: true
}));

app.use(express.json());

// Add request tracking middleware
app.use(requestTrackingMiddleware(monitoring));

// ✅ Apply CORS to Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: dynamicOriginCheck,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ---- Data Stores ----
const users = new Map();
const rooms = new Map();
const privateMessages = new Map();

// Initialize default rooms
rooms.set('general', { name: 'General', users: new Set() });
rooms.set('random', { name: 'Random', users: new Set() });
rooms.set('tech', { name: 'Tech Talk', users: new Set() });

// ---- Routes ----
app.get('/', (req, res) => {
  res.json({ message: 'Chat server is running' });
});

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const healthStatus = monitoring.getHealthStatus(users, io);
  res.json(healthStatus);
});

// Detailed metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = monitoring.getMetrics();
  res.json(metrics);
});

// Performance metrics endpoint
app.get('/api/performance', (req, res) => {
  const performance = monitoring.getPerformanceMetrics();
  res.json(performance);
});

// Ready check for k8s/orchestration
app.get('/ready', (req, res) => {
  const isReady = users !== undefined && io !== undefined;
  res.status(isReady ? 200 : 503).json({
    ready: isReady,
    timestamp: new Date().toISOString()
  });
});

// Liveness check
app.get('/alive', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

// Serve static files from client/public with Range header support for audio
app.get('/notification.mp3', (req, res) => {
  const filePath = path.join(__dirname, '../client/public/notification.mp3');
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000'
    });
    
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000'
    });
    
    fs.createReadStream(filePath).pipe(res);
  }
});

// ---- Socket.IO Logic ----
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  monitoring.incrementSocketConnections();

  // User joins
  socket.on('user:join', (userData) => {
    const user = {
      id: socket.id,
      username: userData.username,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
      online: true,
      currentRoom: 'general'
    };

    users.set(socket.id, user);
    socket.join('general');
    rooms.get('general').users.add(socket.id);

    socket.emit('user:joined', {
      user,
      rooms: Array.from(rooms.entries()).map(([id, room]) => ({
        id,
        name: room.name,
        userCount: room.users.size
      }))
    });

    io.emit('users:update', getUsersList());

    io.to('general').emit('message:receive', {
      id: Date.now(),
      type: 'system',
      content: `${user.username} joined the chat`,
      timestamp: new Date().toISOString(),
      room: 'general'
    });
  });

  // Room switching
  socket.on('room:join', (roomId) => {
    const user = users.get(socket.id);
    if (!user) return;

    const currentRoom = user.currentRoom;

    if (currentRoom && rooms.has(currentRoom)) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).users.delete(socket.id);

      io.to(currentRoom).emit('message:receive', {
        id: Date.now(),
        type: 'system',
        content: `${user.username} left the room`,
        timestamp: new Date().toISOString(),
        room: currentRoom
      });
    }

    if (rooms.has(roomId)) {
      socket.join(roomId);
      rooms.get(roomId).users.add(socket.id);
      user.currentRoom = roomId;

      socket.emit('room:joined', {
        roomId,
        roomName: rooms.get(roomId).name
      });

      io.to(roomId).emit('message:receive', {
        id: Date.now(),
        type: 'system',
        content: `${user.username} joined the room`,
        timestamp: new Date().toISOString(),
        room: roomId
      });

      io.emit('rooms:update', Array.from(rooms.entries()).map(([id, room]) => ({
        id,
        name: room.name,
        userCount: room.users.size
      })));
    }
  });

  // Messaging
  socket.on('message:send', (messageData) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: Date.now() + Math.random(),
      type: 'user',
      content: messageData.content,
      sender: {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      },
      timestamp: new Date().toISOString(),
      room: messageData.room || user.currentRoom,
      reactions: {},
      readBy: [socket.id]
    };

    io.to(message.room).emit('message:receive', message);
    socket.emit('message:sent', { messageId: message.id, success: true });
  });

  // Private messages
  socket.on('private:send', ({ recipientId, content }) => {
    const sender = users.get(socket.id);
    const recipient = users.get(recipientId);
    if (!sender || !recipient) return;

    const message = {
      id: Date.now() + Math.random(),
      type: 'private',
      content,
      sender: {
        id: sender.id,
        username: sender.username,
        avatar: sender.avatar
      },
      recipient: {
        id: recipient.id,
        username: recipient.username
      },
      timestamp: new Date().toISOString(),
      read: false
    };

    io.to(recipientId).emit('private:receive', message);
    socket.emit('private:receive', message);

    const conversationKey = [socket.id, recipientId].sort().join('-');
    if (!privateMessages.has(conversationKey)) {
      privateMessages.set(conversationKey, []);
    }
    privateMessages.get(conversationKey).push(message);
  });

  // Typing indicators
  socket.on('typing:start', ({ room, isPrivate, recipientId }) => {
    const user = users.get(socket.id);
    if (!user) return;

    if (isPrivate && recipientId) {
      io.to(recipientId).emit('typing:update', {
        userId: socket.id,
        username: user.username,
        isTyping: true,
        isPrivate: true
      });
    } else if (room) {
      socket.to(room).emit('typing:update', {
        userId: socket.id,
        username: user.username,
        isTyping: true,
        room
      });
    }
  });

  socket.on('typing:stop', ({ room, isPrivate, recipientId }) => {
    const user = users.get(socket.id);
    if (!user) return;

    if (isPrivate && recipientId) {
      io.to(recipientId).emit('typing:update', {
        userId: socket.id,
        username: user.username,
        isTyping: false,
        isPrivate: true
      });
    } else if (room) {
      socket.to(room).emit('typing:update', {
        userId: socket.id,
        username: user.username,
        isTyping: false,
        room
      });
    }
  });

  // Reactions
  socket.on('message:react', ({ messageId, reaction, room }) => {
    const user = users.get(socket.id);
    if (!user) return;

    io.to(room).emit('message:reaction', {
      messageId,
      reaction,
      userId: socket.id,
      username: user.username
    });
  });

  // Read receipts
  socket.on('message:read', ({ messageId, room }) => {
    io.to(room).emit('message:read:update', {
      messageId,
      readBy: socket.id
    });
  });

  socket.on('private:read', ({ senderId }) => {
    io.to(senderId).emit('private:read:update', {
      readBy: socket.id
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);

    if (user) {
      if (user.currentRoom && rooms.has(user.currentRoom)) {
        rooms.get(user.currentRoom).users.delete(socket.id);

        io.to(user.currentRoom).emit('message:receive', {
          id: Date.now(),
          type: 'system',
          content: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
          room: user.currentRoom
        });
      }

      users.delete(socket.id);

      io.emit('users:update', getUsersList());
      io.emit('rooms:update', Array.from(rooms.entries()).map(([id, room]) => ({
        id,
        name: room.name,
        userCount: room.users.size
      })));

      console.log('User disconnected:', user.username);
    }
  });
});

// ---- Helper ----
function getUsersList() {
  return Array.from(users.values()).map(user => ({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    online: user.online,
    currentRoom: user.currentRoom
  }));
}

// ---- Start Server ----
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});