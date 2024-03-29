var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require('socket.io')(server),
    port = process.env.PORT || 5000,
    mongo = require("mongodb").MongoClient,
    mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/monomono',
    mongoClient,
    roomsDb = null,
    rooms = [];

server.listen(port);

app.use(express.static(__dirname + '/dist'));

app.get('/:room', function(req, res) {
    var options = {
        root: __dirname + '/dist/',
    };
    if (!rooms[req.params.room]) {
        res.sendFile('noroom.html', options);
        return;
    }
    res.sendFile('room.html', options);
})
app.listen(4000);


//http://www.hacksparrow.com/how-to-install-mongodb-on-mac-os-x.html
//http://www.hacksparrow.com/the-mongodb-tutorial.html
mongo.connect(mongoUri, function(error, db) {
	if (error) throw error;
    roomsDb = db.collection('playlist');
    roomsDb.find({}).toArray(function(err, docs) {
        if (err) throw err;
        for (var i = 0; i < docs.length; i++) {
            rooms[docs[i].name] = {
                playlist: docs[i].playlist,
                start: 0,
                currentTrack: 0,
                songTimeout: null,
                users: [],
                chat: []
            };
        }
        console.log('all rooms', rooms);
    });
});

io.on('connection', function(socket) {
    var user = {
        id: socket.id,
        name: 'anonymous',
        img: '/assets/static/img/default.jpg',
        room: ''
    };

    /*
        FRONTPAGE
    */
    socket.on('getRooms', function() {
        var tempRooms = [];
        for (var room in rooms) {
            tempRooms.push(room);
        }
        socket.emit('rooms', tempRooms);
    });

    socket.on('newroom', function(room) {
        rooms[room] = {
            playlist: [],
            users: []
        };
        roomsDb.insert({name:room,playlist: rooms[room].playlist}, function(err) {
            if (err) throw err;
        });
    });

    /*
        ROOMS
    */
    socket.on('joinroom', function(room) {
        console.log('joining room', room);
        user.room = room;
        socket.join(room);
        rooms[user.room].users.push(user);
        io.to(user.room).emit('updatedUsers', rooms[user.room].users);
        console.log('length', rooms[user.room].playlist.length);
        if (rooms[user.room].playlist.length) {
            console.log('sending first song');
            if (rooms[user.room].start === 0) {
                rooms[user.room].start = (new Date()).getTime();
                rooms[user.room].currentTrack = -1;
                playNextSong(user.room);
            } else {
                socket.emit('playSong', rooms[user.room].playlist[rooms[user.room].currentTrack], (new Date()).getTime() - rooms[user.room].start);
                socket.emit('playlist', rooms[user.room].playlist, rooms[user.room].currentTrack);
            }
        }
        if (rooms[user.room].chat.length) {
            socket.emit('allChat', rooms[user.room].chat);
        }
    });

    socket.on('newtrack', function(track) {
        console.log('new track');
        for (var i = 0; i < rooms[user.room].playlist.length; i++) {
            if (rooms[user.room].playlist[i].id == track.id) {
                socket.emit('inqueue');
                return;
            }
        }
        rooms[user.room].playlist.push(track);
        if (rooms[user.room].playlist.length === 1) playNextSong(user.room);
        io.to(user.room).emit('playlist', rooms[user.room].playlist, rooms[user.room].currentTrack);
        updatePlaylist(user.room);
    });

    socket.on('reboot', function() {
        clearTimeout(rooms[user.room].songTimeout);
        rooms[user.room].start = (new Date()).getTime();
        rooms[user.room].currentTrack = 0;
        playNextSong(user.room);
    });

    socket.on('reset', function() {
        playlist = [];
        clearTimeout(rooms[user.room].songTimeout);
        updatePlaylist(user.room);
        console.log('Resetted');
    });

    socket.on('delete', function(id) {
        for (var i = 0; i < rooms[user.room].playlist.length; i++) {
            if (rooms[user.room].playlist[i].id == id) {
                rooms[user.room].playlist.splice(i, 1);
                if (i < rooms[user.room].currentTrack) rooms[user.room].currentTrack--;
                else if (i === rooms[user.room].currentTrack) {
                    playNextSong(user.room);
                }
                io.to(user.room).emit('playlist', rooms[user.room].playlist, rooms[user.room].currentTrack);
            }
        }
        updatePlaylist(user.room);
    });

    socket.on('chatMsg', function(msg, usr) {
        usr.msg = msg;
        console.log('chat');
        rooms[user.room].chat.push(usr);
        io.to(user.room).emit('updateChat', usr);
    });

    socket.on('fb-login', function(fbUser) {
        getUser(user.room, socket.id, function(u, i) {
            user.name = fbUser.name;
            user.img = 'http://graph.facebook.com/' + fbUser.id + '/picture';
            io.to(user.room).emit('updatedUsers', rooms[user.room].users);
        });
    });

    socket.on('disconnect', function() {
        getUser(user.room, user.id, function(u, i) {
            rooms[user.room].users.splice(i, 1);
            io.to(user.room).emit('updatedUsers', rooms[user.room].users);
        });
    });
});

function updatePlaylist(room) {
    roomsDb.update({name:room}, {name:room,playlist: rooms[room].playlist}, function(err) {
        if (err) throw err;
    });
}

function playNextSong(r, start) {
    console.log('playing next song', r);
    var room = rooms[r];
    room.currentTrack++;
    if (room.currentTrack == room.playlist.length) {
        room.currentTrack--;
        var lastSong = room.playlist.shift(0,1);
        room.playlist.push(lastSong);
    }
    io.to(r).emit('playSong', room.playlist[room.currentTrack], 0);
    io.to(r).emit('playlist', room.playlist, room.currentTrack);
    room.start = (new Date()).getTime();
    clearTimeout(room.songTimeout);
    console.log('setting up next song in: ', room.playlist[room.currentTrack].duration + 10);
    room.songTimeout = setTimeout(function() {
        playNextSong(r);
    }, room.playlist[room.currentTrack].duration + 10);
}

function getUser(room, id, callback) {
    console.log('getuser from room: ', room);
    if (!room) return;
    var users = rooms[room].users;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == id) {
            callback(users[i], i);
            return;
        }
    }
}
