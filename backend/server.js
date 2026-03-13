import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mysql from 'mysql2/promise';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import messageRoutes from './routes/messages.js';
import paymentRoutes from './routes/payments.js';

import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// Create database pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join project room
  socket.on('project:join', (projectId, userId) => {
    socket.join(`project-${projectId}`);
    socket.to(`project-${projectId}`).emit('user:joined', {
      userId,
      timestamp: new Date(),
    });
  });

  // Leave project room
  socket.on('project:leave', (projectId, userId) => {
    socket.leave(`project-${projectId}`);
    socket.to(`project-${projectId}`).emit('user:left', {
      userId,
      timestamp: new Date(),
    });
  });

  // Task updates
  socket.on('task:updated', (projectId, task) => {
    io.to(`project-${projectId}`).emit('task:updated', task);
  });

  // New messages
  socket.on('message:sent', (projectId, message) => {
    io.to(`project-${projectId}`).emit('message:new', message);
  });

  // User typing
  socket.on('user:typing', (projectId, userId) => {
    socket.to(`project-${projectId}`).emit('user:typing', userId);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
