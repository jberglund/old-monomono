var express = require("express");
var app = express();
var client = express();
var http = require("http").Server(http);
var io = require('socket.io')(http);
var port = process.env.PORT || 5000;


// Serve the client
app.use(express.static(__dirname + "/dist"));
app.listen(port);

var playlist = [],
    start;

// use like this:
io.on('connection', function(socket) {
    console.log('connected to io');
    if (playlist.length) {
        console.log('sending first song', playlist[0]);
        socket.emit('playSong', playlist[0], (new Date()).getTime() - start);
    }
	socket.on('newtrack', function(track) {
		playlist.push(track);
        console.log('added track', playlist);
        if (playlist.length === 1) playNextSong(true);
        socket.broadcast.emit('playlistUpdate', playlist);
	});

    socket.on('reset', function() {
        playlist = [];
    });

    socket.on('getPlaylist', function() {
        socket.emit('playlist', playlist);
    });
});

// Dedicated socket.io port.
io.listen(9988);


function playNextSong(isFirst) {
    if (!isFirst) playlist.shift();
    if (playlist.length === 0) {
        io.sockets.emit('noMore');
        return;
    }
    console.log('playing next song', playlist);
    io.sockets.emit('playSong', playlist[0], 0);
    start = (new Date()).getTime();
    setTimeout(playNextSong, playlist[0].duration + 10);
}
