jQuery(document).ready(function($) {

    SC.initialize({
        client_id: "182a16fc73b271495eff193ab61b215c",
        redirect_uri: "http://localhost:4000/callback.html",
    });

    var content = $('#screen'),
        searchContainer = $('#search'),
        socket = io.connect(location.hostname === 'localhost' ? 'http://monomono.herokuapp.com/' : 'http://monomono.herokuapp.com/'),
        nowPlaying = $('.now-playing'),
        currentTrack,
        $playlist = $('#playlist ul'),
        mute = $('#mute');
    function createTrack(track){
        this.track = document.createElement('li');
        this.track.setAttribute('class','track');

        this.track.setAttribute('data-track', track.url);
        this.trackArt = document.createElement('img');
        if(track.artwork_url){
           this.trackArt.setAttribute('src', track.artwork_url);
        }
        var text = document.createTextNode(track.title);
        this.track.appendChild(this.trackArt);
        this.track.appendChild(text);
        return this.track;
    }

    var listUrl = document.getElementById('url');
    function lol(){
        searchSoundCloud(listUrl.value);
    }

    addInputCallback(listUrl, lol, 300);

    socket.on('playSong', function(track, skipTo) {
        console.log('playSong', track, skipTo);
        if (!track) return;
        SC.streamStopAll();
        nowPlaying.empty();
        //resolveUrl(track, skipTo);
        addTrack(track, nowPlaying);
        playTrack(track, skipTo);
    });

    function playTrack(track, skipTo){
        console.log('play track', track);
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
                nowPlaying.find('.track__played span').css('transform', 'translateX(' + ((Math.round((this.position/this.duration)*10000)/100)-100) + '%)');
            },
            volume: mute.hasClass('mute') ? 0 : 100,
            position: skipTo
        }, function(sound){
            console.log('sound', sound);
            currentTrack = sound;
            if (sound)
                sound.play();
        });
    }

    function addTrack(track, prependTo){
        var html = Marmelad.templates.searchtrack(track);
        var trackElement = document.createElement('li');
        trackElement.setAttribute('class', 'track');
        trackElement.innerHTML = html;
        console.log('add track', track);
        if (!prependTo.hasClass('now-playing')) {
            trackElement.addEventListener('click', function(){
                socket.emit('newtrack', track);
            });
        }
        prependTo.prepend(trackElement);
    }

    function searchSoundCloud(string){
        SC.get('/tracks', { q: string, limit: 5 }, function(tracks) {
            for (var index in tracks) {
                // Skip if step is not streamable
                if(!tracks[index].streamable) continue;
                addTrack(tracks[index], searchContainer);
            }
        });
    }

    function resolveUrl(trackPermaUrl, skipTo) {
        console.log(trackPermaUrl);
        SC.get('/resolve', { url: trackPermaUrl }, function(track) {
            addTrack(track, nowPlaying);
            playTrack(track, skipTo);
        });
    }

<<<<<<< HEAD
    $(document).on('click', '#reset', function() {
=======
    function populatePlaylist(playlist) {
        var html = '';
        for (var i = 0; i < playlist.length; i++) {
            html += '<li>' + playlist[i].title + '</li>';
        }
        $playlist.html(html);
    }

    $(document).on('click', '#reset', function() {
>>>>>>> monomono/master
        socket.emit('reset');
    });

    $(document).on('click', '#showPlaylist', function() {
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
        if (currentTrack) {
            currentTrack.setVolume(mute.hasClass('mute') ? 100 : 0);
            mute.toggleClass('mute');
        }
    });

    socket.on('playlist', function(playlist) {
        populatePlaylist(playlist);
        $playlist.parent().show();
    });
    socket.on('playlistUpdate', function(playlist) {
        $('#showPlaylist').addClass('new');
    });

    socket.on('noMore', function() {
        alert('No more tracks. Add some more, plz!');
    });


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
});
