const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// This allows the /play/white and /play/black URLs to work
app.get('/play/:color', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    socket.join('game-room');

    socket.on('set-time', (seconds) => {
        io.to('game-room').emit('apply-time', seconds);
    });

    socket.on('move', (move) => {
        socket.to('game-room').emit('move', move);
    });

    // --- ADD THIS SECTION ---
    socket.on('concede', (color) => {
        // Tells both players who conceded
        io.to('game-room').emit('player-conceded', color);
    });
    // ------------------------

    socket.on('rematch-request', () => {
        io.to('game-room').emit('rematch-reset');
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected');
    });
});

    // 2. Listen for moves
    socket.on('move', (move) => {
        // Send the move to the other player in the room
        socket.to('game-room').emit('move', move);
    });

    // 3. Listen for rematch requests
    socket.on('rematch-request', () => {
        // Reset the game for everyone in the room
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

