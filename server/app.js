const express = require('express');

const app = express();
app.set('port', process.env.PORT || 4000);

const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = app.get('port');

const { Users } = require('./user.js');
const { generateMessage } = require('./utils/message');

let users = new Users();

app.use(express.static('public'));

server.listen(port, function() {
    console.log('Server listening on: http://localhost:%s', port);
});

app.get('/', function(req, res) {
    // eslint-disable-next-line no-undef
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
    console.log('New user connected');
    socket.on('join', (data, callback) => {
        console.log(data);
        if (!data.name || !data.room) {
            return callback(new Error('Name or room name is empty'));
        }

        socket.join(data.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, data.name, data.room);

        io.to(data.room).emit('updateUsersList', users.getUserList(data.room));
        
        socket.emit(
            'newMessage',
            generateMessage('Admin', `Welocome to ${data.room}!`)
        );

        socket.broadcast
            .to(data.room)
            .emit('newMessage', generateMessage('Admin', 'New User Joined!'));

        callback();
    });
});
