window.fbAsyncInit = function() {
    FB.init({
        appId      : '950742798299424',
        cookie     : true,  // enable cookies to allow the server to access the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.2' // use version 2.2
    });

    FB.getLoginStatus(function(response) {
        Mono.login(response);
    });
};

var Monomono = Monomono || {};

Monomono = (function($){

    // Good references
    var d   = document,
        db  = document.body,
        dj = $(document);

    SC.initialize({
        client_id: "182a16fc73b271495eff193ab61b215c",
        redirect_uri: "http://localhost:4000/callback.html",
    });

    function MM(){

        // Global variables
        this.currentItemIndex = 0;
        this.searchResultArrayLength = 0;
        this.currentPlayingTrack = null;
        this.currentPlayingElement = null;
        this.facebookUser = null;

        this.selectors = {
            searchResult: $('.js-search-result'),
            seekBar: $('.track__seek__indicator'),
            playlist: $('.js-playlist ul'),
            showPlaylist: $('.js-show-playlist'),
            reset: $('.js-reset'),
            search: $('.js-search'),
            searchContainer: $('.search-container'),
            iosPlay: $('.js-iosplay'),
            mute: $('.js-mute'),
            searchInput: $('.js-search-input'),
            deleteSong: $('.js-delete'),
            login: $('.js-login'),
            userCount: $('.js-number-of-users'),
            chatForm: $('.chat-container form'),
            chatLog: $('#messages ul'),
            chatToggle: $('.chat-container h2 small')
        };

        this.settings = {
            url: location.hostname === 'localhost' ? 'http://127.0.0.1:5000' : 'https://monomono.herokuapp.com/',
        };


        this.socket = io.connect(this.settings.url, { resource: 'assets/js/vendor/socket.js' });

        this.bindEvents();
        this.bindSockets();
        this.bindKeyboard();
    }

    // Monomono Prototype!
    MMP = MM.prototype;

    MMP.login = function(response) {
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
                Mono.facebookUser = response;
                console.log('logged in', response);
                $('.js-login').text('Log out ' + response.first_name).addClass('loggedin');
                _this.selectors.chatForm.find('input').removeAttr('disabled');
            });
        } else if (response.status === 'not_authorized') {
            // The person is logged into Facebook, but not your app.
            console.log('User not logged in');
        } else {
            // The person is not logged into Facebook, so we're not sure if
            // they are logged into this app or not.
            console.log('User not logged in');
        }
    };

    MMP.addTracks = function(tracks, prependTo, playingNum, callback) {
        var trackListLength = tracks.length;

        for (var i = trackListLength; i--;) {
            if(!tracks[i].streamable) continue;

            // Skapar en container för att lättare ha event listeners redo
            var $trackElement = $('<li>');
            $trackElement.addClass('track');

            tracks[i].prettyDuration = formatDuration(tracks[i].duration);
            tracks[i].artwork_url = tracks[i].artwork_url || '/assets/img/default.jpg';

            var html = Marmelad.templates.searchtrack(tracks[i]);
            $trackElement.html(html);
            if (tracks[i].addedBy)
                $trackElement.data('fb-id', tracks[i].addedBy.id);

            if (i == playingNum) {
                this.currentPlayingElement = $trackElement;
                $trackElement.addClass('track--now-playing');
            } else if (i < playingNum) {
                $trackElement.addClass('track--played');
            }

            if (callback && typeof(callback) === "function") {
                callback(tracks[i], $trackElement);
            }

            prependTo.prepend($trackElement);
        }
    };

    MMP.populatePlaylist = function(playlist, currentTrackNumber){
        this.selectors.playlist.empty();
        this.addTracks(playlist, this.selectors.playlist, currentTrackNumber);
    };

    MMP.searchTracks = function(string){
        var _this = this;
        SC.get('/tracks', { q: string, limit: 10 }, function(tracks) {
            _this.selectors.searchResult.empty();
            _this.addTracks(tracks, _this.selectors.searchResult, -1, function(track, trackElement){
                trackElement.on('click', function() {
                    if (!_this.facebookUser) {
                        alert('You need to log in to add tracks');
                        return;
                    }
                    track.addedBy = _this.facebookUser;
                    if (trackElement.hasClass('added')) return;
                    trackElement.addClass('added');
                    _this.socket.emit('newtrack', track);
                });
            });

            _this.searchResultArrayLength = tracks.length;
            _this.currentItemIndex = -1;
         });
    };

    MMP.seekbarPosition = function(track){
        // Overkill med find här eftersom den gör uppslag mot DOM
        // hela tiden. Överväg att finna ett annat sätt att referera till
        // den utanför denna funktionen.
        this.currentPlayingElement.find('.track__seek__indicator').css('transform', 'translateX(' + ((Math.round((track.position/track.duration)*10000)/100)-100) + '%)');
    };

    MMP.playTrack = function(track, skipTo){
        var _this = this;

         SC.stream(track.stream_url, {
             useHTML5Audio: true,
             preferFlash: false,
             onfinish: function() {
                 //egentlig skal starting av neste låt skje fra server...
                 //men vi kan vurdere å sende en beskjed herfra til serveren
                 //om at noen er ferdig allerede?
                 console.log('the song is finished YO. Change the tune!', this);
             },
             whileplaying: function(){
                _this.seekbarPosition(this, _this);
             },
             volume: _this.selectors.mute.hasClass('js-state--mute') ? 0 : 100,
             position: skipTo
         }, function(sound){
            _this.currentPlayingTrack = sound;
             if (sound) sound.play();
             document.title = track.title + ' - monomono';
         });
    };

    // Keyboard controls
    MMP.goTo = function(index){
        if(index >= this.searchResultArrayLength || index < 0 || index === this.currentItemIndex) { return; }
        this.selectors.searchResult.find('.track').removeClass('track--highlight');
        this.selectors.searchResult.find('.track').eq(index).addClass('track--highlight');
        this.currentItemIndex = index;
    };

    MMP.onPrevResult = function () {
        if(this.currentItemIndex === 0){
            this.goTo(this.searchResultArrayLength -1 );
        } else {
            this.goTo((this.currentItemIndex) - 1);
        }
    };

    MMP.onNextResult = function () {
        if(this.currentItemIndex == this.searchResultArrayLength - 1) {
            this.goTo(0);
        } else {
            this.goTo((this.currentItemIndex) + 1);
        }
    };

    MMP.selectResult = function () {
        this.selectors.searchResult.find('.track').eq(this.currentItemIndex).trigger('click');
    };

    MMP.clearResults = function (){
        this.selectors.searchResult.empty();
        this.selectors.searchInput.val('');
        this.toggleSearch();
        this.currentItemIndex = -1;
    };
    // End Keyboard control

    MMP.toggleSearch = function(){
        if (db.classList.contains('search--open')) {
            db.classList.remove('search--open');
            this.selectors.searchResult.empty();
        } else {
            db.classList.add('search--open');
        }
    }

    MMP.bindEvents = function(){
        var _this = this;

        this.selectors.search.on('click', function(){
            //_this.toggleSearch();
        });

        this.selectors.iosPlay.on('click', function() {
            //currentTrack.play();
        });

        this.selectors.chatToggle.on('click', function() {
            $(this).closest('.chat-container').toggleClass('show');
        });

        this.selectors.login.on('click', function() {
            var $this = $(this);
            if ($this.hasClass('loggedin')) {
                FB.logout(function() {
                    $this.text('Log in').removeClass('loggedin');
                });
            } else {
                FB.login(function(response) {
                    _this.login(response);
                });
            }
        });

        dj.on('click', '.js-delete', function(){
            if ($(this).closest('.track').data('fb-id') !== _this.facebookUser.id) {
                alert("Hey! That's not nice. You didn't add that song.\nDon't be a dick.");
                return;
            }
            if (confirm('Sure you want to delete it?')) {
                _this.socket.emit('delete', $(this).closest('.track__info').data('id'));
            }
        });

        this.selectors.mute.on('click', function() {
            if (_this.currentPlayingTrack) {
                _this.currentPlayingTrack.setVolume(_this.selectors.mute.hasClass('js-state--mute') ? 100 : 0);
                _this.selectors.mute.toggleClass('js-state--mute');
            }
        });

    };

    MMP.bindKeyboard = function(){
        var _this = this;
        var timer = null;

        this.selectors.searchInput.on('keypress', function() {
            var thisElement = $(this);
            _this.currentItemIndex = -1;
            if (timer) {
                window.clearTimeout(timer);
            }

            timer = window.setTimeout( function() {
                timer = null;
                _this.searchTracks(thisElement.val());
            }, 400 );
        });

        function searchKeys(e){
            switch(e.keyCode){
                case 38: // Arrow up
                    e.preventDefault();
                    _this.onPrevResult();
                    break;
                case 40: // Arrow down
                    e.preventDefault();
                    _this.onNextResult();
                    break;
                case 13: // Return key
                    e.preventDefault();
                    _this.selectResult();
                    break;
                case 27: // Esc
                    e.preventDefault();
                    _this.clearResults();
                    _this.selectors.searchInput.blur();
                    break;
                default: return;
            }
        }

        function shortKeys(e){
            console.log(e.keyCode);
            switch(e.keyCode){
                case 83: // Arrow up
                    e.preventDefault();
                    _this.selectors.searchInput.focus();
                    break;
                default: return;
            }
        }

        this.selectors.searchInput.on('focus', function(){
            $(this).keydown(searchKeys);
            _this.toggleSearch();
            dj.unbind('keydown');
        });

        this.selectors.searchInput.on('blur', function(){
            $(this).unbind('keydown');
            _this.toggleSearch();
            dj.keydown(shortKeys);
        });

        this.selectors.chatForm.on('submit', function(e) {
            e.preventDefault();
            var msg = $('input', this).val();
            _this.socket.emit('chatMsg', msg, _this.facebookUser);
            $('input', this).val('');
        });

        this.selectors.chatForm.on('click', function() {
            if ($('input', this).attr('disabled'))
                alert("We want to know who's sending them dirty messages.\nLog in to chat.")
        });

        $('input', this.selectors.chatForm).on('blur focus', function(e) {
            if (e.type == 'focus') {
                dj.unbind('keydown');
            } else {
                dj.keydown(shortKeys);
            }
        });

        // On init.
        (function(){
            dj.keydown(shortKeys);
        })();
    }

    MMP.bindSockets = function(){
        var _this = this;

        this.socket.on('playlist', function(playlist, currentTrackNumber) {
            console.log('playlist', playlist);
            _this.populatePlaylist(playlist, currentTrackNumber);
        });

        this.socket.on('noMore', function() {
            alert('No more tracks. Add some more, plz!');
        });

        this.socket.on('playSong', function(track, skipTo) {
            if (!track) return;
            SC.streamStopAll();
            _this.playTrack(track, skipTo);
        });

        this.socket.on('inqueue', function() {
            alert("That song is already in the queue. Don't be a dick!");
        });

        this.socket.on('updatedUsers', function(num) {
            console.log('update users', num);
            _this.selectors.userCount.text(num);
        });

        this.socket.on('updateChat', function(user) {
            var html = Marmelad.templates.chatmessage(user);
            _this.selectors.chatLog.append(html);
        });

        this.socket.on('allChat', function(chat) {
            for (var i = 0; i < chat.length; i++) {
                var html = Marmelad.templates.chatmessage(chat[i]);
                _this.selectors.chatLog.append(html);
            }
        });
    };


    // Helpers!
    function formatDuration(duration){
        duration = duration/1000;
        var min = Math.floor(duration/60);
        var sec = Math.round(duration%60);
        if (sec < 10) sec = '0' + sec;
        return min + ':' + sec;
    }

    return MM;

})(jQuery);

var Mono = new Monomono();
