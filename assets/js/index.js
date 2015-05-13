window.fbAsyncInit = function() {
    FB.init({
        appId      : '950742798299424',
        cookie     : true,  // enable cookies to allow the server to access the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.2' // use version 2.2
    });

    FB.getLoginStatus(function(response) {
        console.log(response);
    });
};

(function() {
    var socketUrl = location.hostname === 'localhost' ? 'http://127.0.0.1:5000' : 'https://monomono.herokuapp.com/',
        socket = io.connect(socketUrl, { resource: 'assets/js/vendor/socket.js' });

    socket.emit('getRooms');
    console.log('getting rooms', socket);
    socket.on('rooms', function(rooms) {
        console.log('rooms', rooms);
        for (var i = 0; i < rooms.length; i++) {
            $('.rooms').prepend('<li><a href="/' + rooms[i].name + '">' + rooms[i].name + '</a></li>')
        }
    });

    $(document).on('click', '.rooms .new', function() {
        var room = '';
        while (!room)
            room = prompt('What would you like to call this room?');

        socket.emit('newroom', room);
        location.href = '/' + room;
    });
})();
