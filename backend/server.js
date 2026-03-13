const express = require('express');
const cors = require('cors')
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
require('./config/db');

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/projects/:projectId/messages', require('./routes/messageRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));



io.on('connection', (socket) => {
  console.log('User connected via WebSocket:', socket.id);


  socket.on('project:join', (data) => {
    socket.join(`project_${data.projectId}`);
    console.log(`User ${data.userName} joined project room: ${data.projectId}`);
    socket.to(`project_${data.projectId}`).emit('user:joined', data);
  });

  socket.on('task:update', (data) => {
    socket.to(`project_${data.projectId}`).emit('task:updated', {
      taskId: data.taskId,
      newStatus: data.newStatus
    });
  });

  socket.on('message:send', (data) => {
    socket.to(`project_${data.projectId}`).emit('message:received', {
      message: data
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server & Websockets running on port ${PORT}`);
});