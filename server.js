var express = require("express");
var app = express();
var client = express();
var server = require("http").createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;


app.use(express.static(__dirname + "/dist"));

var playlist = [],
    start,
    currentTrack = 0;

io.on('connection', function(socket) {
    console.log('connected to io');
    if (playlist.length) {
        console.log('sending first song', playlist[currentTrack]);
        socket.emit('playSong', playlist[currentTrack], (new Date()).getTime() - start);
        socket.emit('playlist', playlist, currentTrack);
    }
	socket.on('newtrack', function(track) {
		playlist.push(track);
        console.log('added track', playlist);
        if (playlist.length === 1) playNextSong();
        io.sockets.emit('playlist', playlist, currentTrack);
	});

    socket.on('reset', function() {
        playlist = [];
        console.log('Resetted');
    });
});

server.listen(port);

function playNextSong() {
    currentTrack++;
    if (currentTrack == playlist.length) {
        currentTrack = 0;
    }
    console.log('playing next song', playlist);
    io.sockets.emit('playSong', playlist[currentTrack], 0);
    io.sockets.emit('playlist', playlist, currentTrack);
    start = (new Date()).getTime();
    setTimeout(playNextSong, playlist[currentTrack].duration + 10);
}
