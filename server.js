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
        socket.emit('playSong', playlist[0].track, (new Date).getTime() - start);
    }
	socket.on('newtrack', function(track, duration) {
		playlist.push({
            track: track,
            duration: duration
        });
        console.log('added track', playlist);
        if (playlist.length === 1) playNextSong(true);
	});

    socket.on('reset', function() {
        playlist = [];
    })
});

function playNextSong(isFirst) {
    if (!isFirst) playlist.shift();
    console.log('playing next song', playlist);
    io.sockets.emit('playSong', playlist[0].track, 0);
    start = (new Date).getTime();
    setTimeout(playNextSong, playlist[0].duration + 10);
}
