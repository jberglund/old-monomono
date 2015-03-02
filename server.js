var express = require("express");
var app = express();
var client = express();
var server = require("http").createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;


app.use(express.static(__dirname + "/dist"));

var playlist = [],
    start;

io.on('connection', function(socket) {
    console.log('connected to io');

    if (playlist.length) {
        console.log('sending first song: ', playlist[0].title);
        socket.emit('playSong', playlist[0], (new Date()).getTime() - start);
        socket.emit('playlist', playlist);
    }
	socket.on('newtrack', function(track) {
		playlist.push(track);
        console.log('added track, length: ', playlist.length);
        if (playlist.length === 1) playNextSong(true);
        socket.broadcast.emit('playlistUpdate', playlist);
	});

    socket.on('reset', function() {
        playlist = [];
        console.log('Resetted');
    });

    socket.on('getPlaylist', function() {
        console.log('get playlist');
        socket.emit('playlist', playlist);
    });
});

server.listen(port);
// Dedicated socket.io port.
//io.listen(port);


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
