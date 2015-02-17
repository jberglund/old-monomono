var ipaddress = 'localhost';
var port = 8080;

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({host:ipaddress, port:port});

wss.broadcast = function(data) {
  for (var i in this.clients)
    this.clients[i].send(data);
};
var playlist = [];
// use like this:
wss.on('connection', function(ws) {

	ws.on('message', function(track) {
		playlist.push(track);
		console.log(playlist);
		wss.broadcast(JSON.stringify(playlist));
	});
});
