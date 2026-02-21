const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// ROUTING: Redirect /play links to game.html
app.get('/play/:color', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

io.on('connection', (socket) => {
    socket.join('game-room');

    // Sync match time
    socket.on('set-time', (seconds) => {
        io.to('game-room').emit('apply-time', seconds);
    });

    // Handle moves
    socket.on('move', (move) => {
        socket.to('game-room').emit('move', move);
    });

    // Handle resignations
    socket.on('concede', (color) => {
        io.to('game-room').emit('player-conceded', color);
    });

    // Handle rematch
    socket.on('rematch-request', () => {
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
