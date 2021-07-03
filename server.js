const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on("connection", socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log('ROOMID:' + roomId);
        console.log('USERID:' + userId);
        socket.join(roomId);
        socket.to(roomId);
        socket.broadcast.emit('user-connected', userId);


        socket.on('disconnect', () => {
            socket.to(roomId);
            socket.broadcast.emit('user-disconnected', userId);
        })
    })
})

server.listen(3003, () => {
    console.log('SERVER ON')
})