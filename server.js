var express = require("express"),
    app = express(),
    client = express(),
    server = require("http").createServer(app),
    io = require('socket.io')(server),
    port = process.env.PORT || 5000,
    mongo = require("mongodb"),
    mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/monomono';

app.use(express.static(__dirname + "/dist"));

var playlist = [],
    start = (new Date()).getTime(),
    currentTrack = 0,
    songTimeout,
    users = [],
    chat = [];

//http://www.hacksparrow.com/how-to-install-mongodb-on-mac-os-x.html
//http://www.hacksparrow.com/the-mongodb-tutorial.html
new mongo.Db.connect(mongoUri, function(error, mongoClient) {
	if (error) throw error;
	playlistDb = new mongo.Collection(mongoClient, "playlist");
    playlistDb.find({name:'room1'}).toArray(function(err, docs) {
		if (err) throw err;
        console.log('getting doc');
        if (!docs.length) {
            console.log('insert');
            playlistDb.insert({name:'room1', playlist:playlist}, {w:1}, function(err) {
				if (err) throw err;
			});
        } else {
            playlist = docs[0].playlist;
        }
	});
});

io.on('connection', function(socket) {
    console.log('connected to io');
    if (playlist.length) {
        console.log('sending first song');
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
        if (playlist.length === 1) playNextSong();
        io.sockets.emit('playlist', playlist, currentTrack);
        updatePlaylist();
    });

    socket.on('reset', function() {
        playlist = [];
        clearTimeout(songTimeout);
        updatePlaylist();
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
        console.log('chat');
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

function updatePlaylist() {
    playlistDb.update({name:'room1'}, {name:'room1',playlist: playlist}, function(err) {
        if (err) throw err;
    });
}

function playNextSong() {
    currentTrack++;
    if (currentTrack == playlist.length) {
        currentTrack--;
        var lastSong = playlist.shift(0,1);
        playlist.push(lastSong);
    }
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
