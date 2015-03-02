var express = require("express");
var app = express();
var http = require("http").Server(http);
var io = require('socket.io')(http);

var port = process.env.PORT || 5000;
app.use(express.static(__dirname + "/"));

http.listen(port, function(){
  console.log('listening on *:' + port);
});

var playlist = [];
// use like this:
io.on('connection', function(socket) {
    console.log('connected to io');
    if (playlist.length) {
        console.log('sending first song', playlist[0]);
        socket.emit('playSong', playlist[0], (new Date).getTime() - start);
    }
	socket.on('newtrack', function(track) {
		playlist.push(track);
        console.log('added track', playlist);
        if (playlist.length === 1) playNextSong(true);
	});

    socket.on('reset', function() {
        playlist = [];
    });

    socket.on('getPlaylist', function() {
        socket.emit('playlist', playlist);
    });
});

function playNextSong(isFirst) {
    if (!isFirst) playlist.shift();
    if (playlist.length === 0) {
        io.sockets.emit('noMore');
        return;
    }
    console.log('playing next song', playlist);
    io.sockets.emit('playSong', playlist[0], 0);
    start = (new Date).getTime();
    setTimeout(playNextSong, playlist[0].duration + 10);
}
