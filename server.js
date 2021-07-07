const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origins: ['http://localhost:4200']
    }
});

app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

io.on("connection", socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log('ROOMID:' + roomId);
        console.log('USERID:' + userId);
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        })
    })

    socket.on('connect-error', error => {
        console.log(error)
    })
})

server.listen(3003, () => {
    console.log('SERVER ON')
})