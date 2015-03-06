
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
        this.currentItemIndex = 0;
        this.searchResultArrayLength = 0;
        this.currentTrack;

        this.selectors = {
            searchResult: $('.js-search-result'),
            nowPlaying: $('.js-now-playing'),
            playlist: $('.js-playlist ul'),
            showPlaylist: $('.js-show-playlist'),
            reset: $('.js-reset'),
            search: $('.js-search'),
            searchContainer: $('.search-container'),
            iosPlay: $('.js-iosplay'),
            mute: $('.js-mute'),
            searchInput: $('.js-search-input')
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
            var trackElement = document.createElement('li');
            // Skapar en container för att lättare ha event listeners redo
            trackElement.setAttribute('class', 'track');

            var html = Marmelad.templates.searchtrack(tracks[i]);
            trackElement.innerHTML = html;
            if (i == playingNum) {
                trackElement.classList.add('now-playing');
                trackElement.classList.add('js-now-playing');
            } else if (i < playingNum) {
                trackElement.classList.add('played');
            }

            if (callback && typeof(callback) === "function") {
                callback(tracks[i], trackElement);
            }

            prependTo.prepend(trackElement);
        }
    };

    MMP.populatePlaylist = function(playlist){
        console.log('playlist: ', playlist, this.currentTrack);
        this.selectors.playlist.empty();
        this.addTracks(playlist, this.selectors.playlist, this.currentTrack);
    };

    MMP.searchTracks = function(string){
        var _this = this;
        SC.get('/tracks', { q: string, limit: 10 }, function(tracks) {
             _this.addTracks(tracks, _this.selectors.searchResult, -1, function(track, trackElement){
                trackElement.addEventListener('click', function(){
                    if (trackElement.classList.contains('added')) return;
                    trackElement.classList.add('added');
                    _this.socket.emit('newtrack', track);

                });
            });
            _this.searchResultArrayLength = tracks.length;

         });
    };

    MMP.seekbarPosition = function(track){
        var _this = track;
        this.selector.nowPlaying.find('.track__seek__indicator').css('transform', 'translateX(' + ((Math.round((_this.position/_this.duration)*10000)/100)-100) + '%)');
    };

    MMP.playTrack = function(track, skipTo){
         SC.stream(track.stream_url, {
             useHTML5Audio: true,
             preferFlash: false,
             onfinish: function() {
                 //egentlig skal starting av neste låt skje fra server...
                 //men vi kan vurdere å sende en beskjed herfra til serveren
                 //om at noen er ferdig allerede?
                 console.log('the song is finished YO. Change the tune!', this);
             },
             whileplaying: this.seekbarPosition(this),
             volume: selector.mute.hasClass('js-state--mute') ? 0 : 100,
             position: skipTo
         }, function(sound){
             currentTrack = sound;
             if (sound) sound.play();
         });
    }


    MMP.goTo = function(index){
        //index = Number(index - 1);
        console.log(index);
        if(index >= this.searchResultArrayLength || index < 0 || index === this.currentItemIndex) { return; }
        this.currentItemIndex = index;
        $('.track').removeClass('track--highlight');
        $('.track').eq(index).addClass('track--highlight');
    }
    MMP.onPrevResult = function () {
        this.goTo((this.currentItemIndex) - 1);
    };

    MMP.onNextResult = function () {
        if(this.currentItemIndex + 1 === this.searchResultArrayLength) {
            this.goTo(0);
        } else {
          this.goTo((this.currentItemIndex) + 1);
        }
    };

    MMP.bindEvents = function(){
        // Referera till this så vi kan nå den innanför ELs.
        var _this = this;
        var timer = null;

        this.selectors.searchInput.on('keypress', function() {
            var inputValue = $(this).val();
            _this.selectors.searchResult.empty();

            if (timer) {
                window.clearTimeout(timer);
            }

            timer = window.setTimeout( function() {
                timer = null;
                _this.searchTracks(inputValue);
            }, 400 );
        });

        dj.keydown(function(e){
            switch(e.which){
                case 38: //up
                    _this.onPrevResult();
                case 40: //down
                    _this.onNextResult();
                default: return;
            }
        });


        this.selectors.reset.on('click', function() {
            this.socket.emit('reset');
        });

        this.selectors.iosPlay.on('click', function() {
            currentTrack.play();
        });

        this.selectors.showPlaylist.on('click', function() {
            this.socket.emit('getPlaylist');
        });

        this.selectors.mute.on('click', function() {
            if (currentTrack) {
                currentTrack.setVolume(selector.mute.hasClass('js-state--mute') ? 100 : 0);
                _this.selectors.mute.toggleClass('js-state--mute');
            }
        });

        this.selectors.search.on('click', function() {
            _this.selectors.searchContainer.addClass('show');
            if (db.classList.contains('openSearch')) {
                db.classList.remove('openSearch');
                _this.selectors.searchResult.empty();
            } else {
                document.body.classList.add('openSearch');
                $('#url').focus();
            }
        });
    };

    MMP.bindSockets = function(){
        var _this = this;

        this.socket.on('playlist', function(playlist, currentTrack) {
            _this.populatePlaylist(playlist, currentTrack);
        });

        this.socket.on('noMore', function() {
            alert('No more tracks. Add some more, plz!');
        });
    };

    return MM;

})(jQuery);

var Mono = new Monomono();
