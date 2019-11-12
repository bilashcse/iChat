const express = require('express');

const app = express();
app.set('port', process.env.PORT || 4000);

const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = app.get('port');

const { Users } = require('./utils/user');
const { generateMessage } = require('./utils/message');

let users = new Users();

app.use(express.static('public'));

server.listen(port, () => {
    console.log('Server listening on: http://localhost:%s', port);
});

app.get('/', (req, res) => {
    // eslint-disable-next-line no-undef
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
    console.log('New user connected');
    socket.on('join', (data, callback) => {
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

    socket.on('createMessage', (data, callback) => {
        const user = users.getUser(socket.id); 
        if (user && (user.length > 0)&& data.text) {
            io.to(user[0].room).emit('newMessage', generateMessage(user[0].name, data.text));
        }

        callback();
    });

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);

        if(user && (user.length > 0)){
            io.to(user[0].room).emit('updateUsersList', users.getUserList(user[0].room));
            io.to(user[0].room).emit('newMessage', generateMessage('Admin', `${user[0].name} has left ${user[0].room} chat room.`));
        }
    });
});
