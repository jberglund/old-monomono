jQuery(document).ready(function($) {

    SC.initialize({
        client_id: "182a16fc73b271495eff193ab61b215c",
        redirect_uri: "http://localhost:4000/callback.html",
    });

    var content = $('#screen');
    var searchContainer = $('#search');
    var socket = io.connect(location.hostname === 'localhost' ? 'localhost:5000' : '/');
    var nowPlaying = $('.now-playing');
    var currentTrack;
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
        searchSoundCloud(listUrl.value)
    }

    addInputCallback(listUrl, lol, 300);

    socket.on('playlist', function(playlist) {
        console.log('playlist', playlist);
        if (playlist.length === 0) return;
        
        SC.streamStopAll();
        nowPlaying.empty();

        var latest = playlist.length-1;
        resolveUrl(playlist[latest]);
    });

    function playTrack(track){
        console.log('track', track);
        SC.stream(track.stream_url, {
            onfinish: function() {
                console.log('the song is finished YO. Change the tune!', this);
            },
            whileplaying: function() {
                console.log('antall prosent streamet: ', Math.round((this.position/this.duration)*10000)/100 + '%');
            }
        },function(sound){
            console.log(sound);
            sound.play();
        });
    }

    function addTrack(track, prependTo){
        var html = Marmelad.templates.searchtrack(track);
        var trackElement = document.createElement('li');
        trackElement.setAttribute('class', 'track');
        trackElement.innerHTML = html;
        trackElement.addEventListener('click', function(){
            socket.emit('newtrack', track.permalink_url);
        });
        prependTo.prepend(trackElement);
    }

    function searchSoundCloud(string){
        SC.get('/tracks', { q: string, limit: 5 }, function(tracks) {
            for(var index in tracks ){

                // Skip if step is not streamable
                if(!tracks[index].streamable) continue;

                addTrack(tracks[index], searchContainer);
            }
        });
    }

    function resolveUrl(trackPermaUrl, callback){
        console.log(trackPermaUrl);
        SC.get('/resolve', { url: trackPermaUrl }, function(track) {
            addTrack(track, nowPlaying);
            playTrack(track);
        });
    }

    $(document).on('click', '#reset', function() {
        socket.emit('reset');
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
