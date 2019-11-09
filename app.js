const express = require('express');

const app = express();
app.set('port', process.env.PORT || 3000);

const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = app.get('port');

app.use(express.static('public'));

server.listen(port, function () {
    console.log('Server listening on: http://localhost:%s', port);
});
var usernames = {};
var rooms = [];

app.get('/', function(req, res) {
    // eslint-disable-next-line no-undef
    res.sendFile(__dirname + '/index.html');
});


const allRooms = socket => {
    return socket.emit('roomlist', rooms);
};

io.on('connection', socket => {
    socket.on('createroom', data => {
        const roomId = Math.random().toString().substring(2, 7);
        rooms.push({
            id: roomId,
            name: data.roomName,
            users: []
        });
        console.log(rooms);
        socket.emit('notification', `New room created: ${data.roomName}(${roomId})`);
        allRooms(socket);
    });

    socket.on('roomlist', () => {
        allRooms(socket);
    }); 

    socket.on('deleteroom', (id) => {
        rooms = rooms.filter(room => room.id === id);
        socket.emit('notification', 'Room deleted successfully.');
    });

    socket.on('disconnect', () => {
        rooms = [];
        socket.emit('notification', 'User disconnected');
    });
});