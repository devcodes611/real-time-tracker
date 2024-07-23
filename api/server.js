const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const { createServer } = require('http');

const app = express();
const server = createServer(app);
const io = socketio(server);

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('send-location', (data) => {
        io.emit('received-location', { id: socket.id, ...data });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        io.emit('user-disconnected', socket.id);
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

// Export serverless function
module.exports = (req, res) => {
    // Handle requests using Express app
    return new Promise((resolve, reject) => {
        server.emit('request', req, res);
        res.on('finish', resolve);
        res.on('error', reject);
    });
};
