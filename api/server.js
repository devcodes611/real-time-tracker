const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', 'ejs');
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

// Vercel specific serverless function handler
module.exports = (req, res) => {
    return new Promise((resolve, reject) => {
        server.listen(5000, () => {
            console.log('Server listening on port 5000');
            resolve();
        }).on('error', (err) => {
            reject(err);
        });
    });
};
