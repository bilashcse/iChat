const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
    console.log('New user connected');

    socket.on('chat message', msg => {
    // socket.broadcast.emit("hi");
        io.emit('new message', msg);
        console.log('message: ' + msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(3000, function() {
    console.log('listening on port: 3000');
});
