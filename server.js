var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");
var app = express();
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + "/"));

var server = http.createServer(app);
server.listen(port);

console.log("http server listening on %d", port)

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({server: server});

wss.broadcast = function(data) {
  for (var i in this.clients)
    this.clients[i].send(data);
};
var playlist = [];
// use like this:
wss.on('connection', function(ws) {
    wss.broadcast(JSON.stringify(playlist));
	ws.on('message', function(msg) {
        if (msg.name == 'newtrack') {
    		playlist.push(msg.track);
    		console.log(playlist);
    		wss.broadcast(JSON.stringify(playlist));
        } else if (msg.name == 'reset') {
            playlist = [];
        }
	});
});
