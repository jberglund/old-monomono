$(function(){
    SC.initialize({
        client_id: "182a16fc73b271495eff193ab61b215c",
        redirect_uri: "http://localhost:4000/callback.html",
    });

<<<<<<< HEAD
    var selector = {
        searchResult: $('.js-search-result'),
        nowPlaying: $('.js-now-playing'),
        playlist: $('.js-playlist ul'),
        showPlaylist: $('.js-show-playlist'),
        reset: $('.js-reset'),
        iosPlay: $('.js-iosplay'),
        mute: $('.js-mute')
    }

    var appUrl = location.hostname === 'localhost' ? 'http://127.0.0.1:5000' : 'https://monomono.herokuapp.com/',
=======
    var content = $('#screen'),
        searchContainer = $('#search'),
        appUrl = location.hostname === 'localhost' ? 'http://127.0.0.1:5000' : 'https://monomono.herokuapp.com/',
>>>>>>> monomono/master
        socket = io.connect(appUrl, { resource: 'assets/js/vendor/socket.js' }),
        currentTrack;

    var listUrl = document.getElementById('url');

    function onKeyboardInput(){
        selector.searchResult.empty();
        searchSoundCloud(listUrl.value);

    }

    function addTracks(tracks, prependTo, callback){
        var trackListLength = tracks.length;

        for (var i = 0; i < trackListLength; i++) {
            if(!tracks[i].streamable) continue;
            var trackElement = document.createElement('li');
            // Skapar en container för att lättare ha event listeners redo
            trackElement.setAttribute('class', 'track');

            var html = Marmelad.templates.searchtrack(tracks[i]);
            trackElement.innerHTML = html;

            if (callback && typeof(callback) === "function") {
                callback(tracks[i], trackElement);
            }

            prependTo.prepend(trackElement);
        };
    }

    function populatePlaylist(playlist) {
        console.log('playlist: ', playlist);
        addTracks(playlist, selector.playlist);
    }

    addInputCallback(listUrl, onKeyboardInput, 300);

    socket.on('playSong', function(track, skipTo) {
       // console.log('playSong', track, skipTo);
        if (!track) return;
        SC.streamStopAll();
        selector.nowPlaying.empty();
        //resolveUrl(track, skipTo);
        addTracks([track], selector.nowPlaying);

        playTrack(track, skipTo);
    });

    function playTrack(track, skipTo){
       // console.log('play track', track);
        SC.stream(track.stream_url, {
            useHTML5Audio: true,
            preferFlash: false,
            onfinish: function() {
                //egentlig skal starting av neste låt skje fra server...
                //men vi kan vurdere å sende en beskjed herfra til serveren
                //om at noen er ferdig allerede?
                console.log('the song is finished YO. Change the tune!', this);
            },
            whileplaying: function() {
                selector.nowPlaying.find('.track__seek__indicator').css('transform', 'translateX(' + ((Math.round((this.position/this.duration)*10000)/100)-100) + '%)');
            },
            volume: selector.mute.hasClass('js-state--mute') ? 0 : 100,
            position: skipTo
        }, function(sound){
           // console.log('sound', sound);
            currentTrack = sound;
            if (sound)
                sound.play();
        });
    }


    function searchSoundCloud(string){
        SC.get('/tracks', { q: string, limit: 5 }, function(tracks) {
            addTracks(tracks, selector.searchResult, function(track, trackElement){
                trackElement.addEventListener('click', function(){
                    socket.emit('newtrack', track);
                });

            });
            bindSearchKeys($('.search-result .track'));
        });
    }

    function resolveUrl(trackPermaUrl, skipTo) {
        SC.get('/resolve', { url: trackPermaUrl }, function(track) {
            addTrack(track, nowPlaying);
            playTrack(track, skipTo);
        });
    }

<<<<<<< HEAD
    selector.reset.on('click', function() {
        socket.emit('reset');
    });

    selector.iosPlay.on('click', function() {
        currentTrack.play();
    });

    selector.showPlaylist.on('click', function() {
        socket.emit('getPlaylist');
    });

    selector.mute.on('click', function() {
=======
    function populatePlaylist(playlist) {
        var html = '';
        for (var i = 0; i < playlist.length; i++) {
            html += '<li>' + playlist[i].title + '</li>';
        }
        $playlist.html(html);
    }

    $(document).on('click', '#reset', function() {
        socket.emit('reset');
    });

    $(document).on('click', '#showPlaylist', function() {
        $(this).removeClass('new');
        socket.emit('getPlaylist');
    });

    $(document).on('click', '#playlist .close', function() {
        $playlist.parent().hide();
    });
    $('#iosplay').on('click', function() {
        console.log('ios play');
        currentTrack.play();
    });
    $(document).on('click', '#mute', function() {
        console.log('mute');
>>>>>>> monomono/master
        if (currentTrack) {
            currentTrack.setVolume(selector.mute.hasClass('js-state--mute') ? 100 : 0);
            selector.mute.toggleClass('js-state--mute');
        }
    });

    socket.on('playlist', function(playlist) {
        populatePlaylist(playlist);
    });

    socket.on('playlistUpdate', function(playlist) {
        $('#showPlaylist').addClass('new');
    });

    socket.on('noMore', function() {
        alert('No more tracks. Add some more, plz!');
    });
<<<<<<< HEAD
=======


    $(document).keydown(function(e) {
        switch(e.which) {
            case 37: // left
            break;

            case 38: // up
            break;

            case 39: // right
            break;

            case 40: // down
            break;

            default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
>>>>>>> monomono/master
});
