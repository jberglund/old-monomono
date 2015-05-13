window.fbAsyncInit = function() {
    FB.init({
        appId      : '950742798299424',
        cookie     : true,  // enable cookies to allow the server to access the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.2' // use version 2.2
    });

    FB.getLoginStatus(login);
};

function login(response) {
    console.log('statusChangeCallback');
    console.log(response);
    var _this = this;
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        FB.api('/me', function(response) {
            console.log('logged in', response);
            $('.js-login').text('Log out ' + response.first_name).addClass('loggedin');
        });
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        console.log('User not logged in');
    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        console.log('User not logged in');
    }
}

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
        while (!room) {
            room = prompt('What would you like to call this room?');
            if (room === null) return;
        }
        return;

        socket.emit('newroom', room);
        location.href = '/' + room;
    });

    $(document).on('click', '.js-login', function() {
        FB.login(login, { scope: 'public_profile, email' });
    })
})();
