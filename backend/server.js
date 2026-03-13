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
app.use('/api/payments', require('./routes/paymentRoutes'));



io.on('connection', (socket) => {
  console.log('User connected via WebSocket:', socket.id);


  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`User joined project room: ${projectId}`);
  });


  socket.on('task_moved', (data) => {
    socket.to(`project_${data.projectId}`).emit('update_board', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server & Websockets running on port ${PORT}`);
});