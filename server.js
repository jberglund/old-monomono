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
    socket.emit('playlist', playlist);
	socket.on('newtrack', function(track) {
		playlist.push(track);
		console.log(playlist);
		io.sockets.emit('playlist', playlist);
	});

    socket.on('reset', function() {
        playlist = [];
    })
});
