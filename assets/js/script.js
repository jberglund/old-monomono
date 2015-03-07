
var Monomono = Monomono || {};

Monomono =  (function($){

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
        this.currentItemIndex;
        this.searchResultArrayLength;
        this.currentPlayingTrack;
        this.currentPlayingElement;

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
            deleteSong: $('.js-delete')
        }

        this.settings = {
            url: location.hostname === 'localhost' ? 'http://127.0.0.1:5000' : 'https://monomono.herokuapp.com/',
        }


        this.socket = io.connect(this.settings.url, { resource: 'assets/js/vendor/socket.js' })

        this.bindEvents();
        this.bindSockets();
        //this.bindKeyboard();
    }

    // Monomono Prototype!
    MMP = MM.prototype;

    MMP.addTracks = function(tracks, prependTo, playingNum, callback){
        var trackListLength = tracks.length;

        for (var i = trackListLength; i--;) {
            if(!tracks[i].streamable) continue;

            // Skapar en container för att lättare ha event listeners redo
            var trackElement = document.createElement('li');
                trackElement.setAttribute('class', 'track');

            tracks[i].prettyDuration = formatDuration(tracks[i].duration);

            var html = Marmelad.templates.searchtrack(tracks[i]);
            trackElement.innerHTML = html;
            if (i == playingNum) {
                trackElement.classList.add('now-playing');
                trackElement.classList.add('js-now-playing');
            } else if (i < playingNum) {
                trackElement.classList.add('played');
            }

            if (i == playingNum) {
                this.currentPlayingElement = $(trackElement);
                trackElement.classList.add('track--now-playing');
            } else if (i < playingNum) {
                trackElement.classList.add('track--played');
            }

            if (callback && typeof(callback) === "function") {
                callback(tracks[i], trackElement);
            }

            prependTo.prepend(trackElement);
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
                trackElement.addEventListener('click', function(){
                    if (trackElement.classList.contains('added')) return;
                    trackElement.classList.add('added');
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
         });
    }

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
        this.currentItemIndex = -1;
    };
    // End Keyboard control

    MMP.bindEvents = function(){
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

        dj.keydown(function(e){
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
                default: return;
            }
        });

        this.selectors.iosPlay.on('click', function() {
            //currentTrack.play();
        });

        dj.on('click', '.js-delete', function(){
            if (confirm('Sure you want to do that? Might be kind of an asshole move...')) {
                _this.socket.emit('delete', $(this).closest('.track__info').data('id'));
            }
        });

        this.selectors.mute.on('click', function() {
            if (_this.currentPlayingTrack) {
                _this.currentPlayingTrack.setVolume(_this.selectors.mute.hasClass('js-state--mute') ? 100 : 0);
                _this.selectors.mute.toggleClass('js-state--mute');
            }
        });

        this.selectors.search.on('click', function() {
            _this.selectors.searchContainer.addClass('search--show');
            if (db.classList.contains('search--open')) {
                db.classList.remove('search--open');
                _this.selectors.searchResult.empty();

            } else {
                document.body.classList.add('search--open');
                _this.selectors.searchInput.focus();

            }
        });
    };

    MMP.bindSockets = function(){
        var _this = this;

        this.socket.on('playlist', function(playlist, currentTrackNumber) {
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
