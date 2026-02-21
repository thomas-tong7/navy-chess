const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// This allows the /play/white and /play/black URLs to work
app.get('/play/:color', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);
    socket.join('game-room');

    // 1. Move listener (already there)
    socket.on('move', (data) => {
        socket.to('game-room').emit('move', data);
    });

    // 2. ADD THIS PART HERE:
    socket.on('rematch-request', () => {
        // Tells everyone in the room (both players) to reset
        io.to('game-room').emit('rematch-reset');
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

