var express = require("express");
var app = express();
var client = express();
var server = require("http").createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;


app.use(express.static(__dirname + "/dist"));

var playlist = [],
    start,
    currentTrack = 0,
    songTimeout,
    users = [],
    chat = [];

io.on('connection', function(socket) {
    console.log('connected to io');
    if (playlist.length) {
        console.log('sending first song', playlist[currentTrack]);
        socket.emit('playSong', playlist[currentTrack], (new Date()).getTime() - start);
        socket.emit('playlist', playlist, currentTrack);
    }
    if (chat.length) {
        socket.emit('allChat', chat);
    }
    socket.on('newtrack', function(track) {
        for (var i = 0; i < playlist.length; i++) {
            if (playlist[i].id == track.id) {
                socket.emit('inqueue');
                return;
            }
        }
        playlist.push(track);
        console.log('added track', playlist);
        if (playlist.length === 1) playNextSong();
        io.sockets.emit('playlist', playlist, currentTrack);
    });

    socket.on('reset', function() {
        playlist = [];
        clearTimeout(songTimeout);
        console.log('Resetted');
    });

    socket.on('delete', function(id) {
        for (var i = 0; i < playlist.length; i++) {
            if (playlist[i].id == id) {
                playlist.splice(i, 1);
                if (i < currentTrack) currentTrack--;
                else if (i === currentTrack) {
                    playNextSong();
                }
                io.sockets.emit('playlist', playlist, currentTrack);
            }
        }
    });

    socket.on('chatMsg', function(msg, user) {
        user.msg = msg;
        console.log('chat', user);
        chat.push(user);
        io.sockets.emit('updateChat', user);
    });

    //users
    var user = {
        id: socket.id,
        name: 'anonymous',
        img: '/assets/static/img/default.jpg'
    }
    users.push(user);
    io.sockets.emit('updatedUsers', users);
    socket.on('fb-login', function(fbUser) {
        console.log('fb-login', fbUser);
        getUser(socket.id, function(u, i) {
            user.name = fbUser.name;
            user.img = 'http://graph.facebook.com/' + fbUser.id + '/picture';
            io.sockets.emit('updatedUsers', users);
        });
    });

    socket.on('disconnect', function() {
        getUser(user.id, function(u, i) {
            users.splice(i, 1);
            io.sockets.emit('updatedUsers', users);
        });
    });
});

server.listen(port);

function playNextSong() {
    currentTrack++;
    if (currentTrack == playlist.length) {
        currentTrack--;
        var lastSong = playlist.shift(0,1);
        playlist.push(lastSong);
    }
    console.log('playing next song', playlist);
    io.sockets.emit('playSong', playlist[currentTrack], 0);
    io.sockets.emit('playlist', playlist, currentTrack);
    start = (new Date()).getTime();
    clearTimeout(songTimeout);
    songTimeout = setTimeout(playNextSong, playlist[currentTrack].duration + 10);
}

function getUser(id, callback) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == id) {
            callback(users[i], i);
            return;
        }
    }
}
