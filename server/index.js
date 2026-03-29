const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const roomRoutes = require('./routes/rooms');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: '*', // For development, allow all origins
}));
app.use(express.json());

// API Routes
app.use('/api/rooms', roomRoutes);

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chatsphere';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Track online users in each room mapping userId -> { username, roomId }
// For simplicity, we can use socket.id
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // join_room
    socket.on('join_room', async ({ roomId, username, avatar, color }) => {
        socket.join(roomId);
        onlineUsers.set(socket.id, { username, roomId, avatar, color });

        console.log(`${username} joined room ${roomId}`);

        // Notify others in room
        socket.to(roomId).emit('user_joined', { username, avatar, color });

        // Broadcast updated online count passing full user object instead of string
        const usersInRoom = Array.from(onlineUsers.values()).filter(u => u.roomId === roomId);
        io.to(roomId).emit('online_users_update', usersInRoom.map(u => ({ username: u.username, avatar: u.avatar, color: u.color })));
    });

    // send_message
    socket.on('send_message', async (data) => {
        const { roomId, username, text, avatar, color } = data;

        try {
            const newMessage = new Message({
                roomId,
                username,
                text,
                avatar,
                color
            });
            await newMessage.save();

            // broadcast to room
            io.to(roomId).emit('receive_message', {
                _id: newMessage._id,
                roomId,
                username,
                text,
                avatar: newMessage.avatar,
                color: newMessage.color,
                createdAt: newMessage.createdAt
            });
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    // typing indicating
    socket.on('typing', ({ roomId, username }) => {
        socket.to(roomId).emit('user_typing', { username });
    });

    socket.on('stop_typing', ({ roomId, username }) => {
        socket.to(roomId).emit('user_stopped_typing', { username });
    });

    // disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const userData = onlineUsers.get(socket.id);
        if (userData) {
            onlineUsers.delete(socket.id);

            // Update room users count
            const usersInRoom = Array.from(onlineUsers.values()).filter(u => u.roomId === userData.roomId);
            io.to(userData.roomId).emit('online_users_update', usersInRoom.map(u => ({ username: u.username, avatar: u.avatar, color: u.color })));
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
