/**
 * Created by armin on 11/9/14.
 */

var Playlist = require('./playlist.model');
var Playlog = require('../playlog/playlog.model');
var Song = require('../song/song.model');

var PlaylistManager = function() {

  var manager = null;
  var currentSong = null;
  var votingPeriod = 180;
  var countInterval = 1;
  var timer = 0;
  var sockets = {};

  function refill(max, callback) {

    console.log('Refilling playlist');

    Playlist.find({ played: 0 }, function(err, tracks) {
      console.log('Found %d tracks', tracks.length);

      console.log('Playlist is empty.');

      console.log('Song search...');

      Song.find({})
        .sort('-votes.total')
        .limit(max)
        .exec(function(err, songs) {

          function announceAdd(err, newTrack) {

            if (err) return handleError(err);

            console.log('Adding %s to playlist.', newTrack);
            newTrack.save(function() {});

          }

          console.log('Found %d songs to add', songs.length);
          for(var i = 0; i < songs.length; i++) {
            Playlist.create({ _song: songs[i]._id, played:0 }, announceAdd)

          }

        });

    });

    callback();

  }

  this.register = function(sSocket) {

    sockets[sSocket.id] = sSocket;

    console.log('Registered %s', sockets[sSocket.id]);
    //console.log(socket[sSocket.id]);

  };

  this.unregister = function(sSocket) {

    delete sockets[sSocket.id];

    console.log('Unregistered %s', sSocket.id);
    //console.log(socket[sSocket.id]);

  };

  this.start = function() {

    currentSong = {};

    //console.log('Found socket: %s', socket);
    //socket.emit('playlist:timer', timer);

    refill(40, function() {

      manager = setInterval(function() { manage(sockets); }, countInterval*1000);

    });

  };

  this.stop = function() {

    clearInterval(manager);
    manager = null;

  };

  function switchTrack() {

    Playlist.find({})
      .sort('-votes')
      .limit(1)
      .populate('_song')
      .exec(function (err, nextSong) {

        if(err) {
          console.log('There was an error: %s', err);
          return;
        }

        if(nextSong.length > 1) {

          Playlog.create({
            date: Date.now(),
            _song: nextSong[0]._song._id,
            votes: nextSong[0].votes
          }, function (err, newLog) {

            if (err) {

              console.log('There was an error: %s', err);

            }

            nextSong[0].remove();


          });
        }

      });

  }

  function manage(sockets) {

    console.log('Managing');

    console.log('Manager is emitting %d on the socket', timer);

    for (var socket in sockets) {
      if (sockets.hasOwnProperty(socket)) {
        console.log('Emitting to %s', socket);
        if(sockets[socket]) {
          sockets[socket].emit('timer', timer);
        }
      }
    }
    //socket.emit('timer', timer);

    if (timer > 0) {
      timer -= countInterval;
      console.log('votingPeriod now at %d of %d', timer, votingPeriod);
      //console.log('playlist id is %s', currentSong.playlist._id);
    }
    else {

      console.log('Counting');

      Playlist.count(function(err, count) {
        console.log(count);
        if(count < 2) {
          refill(5, function() {
            console.log('Refilled.');
            switchTrack();
          });
        }
        else {
          switchTrack();
        }
        timer = votingPeriod;
      });


    }

  }

  //TODO: redo this function
  this.addTrack = function(track) {

    //tracks.push(track);
    console.log('track %s added to the playlist', track);

  };

  this.currentSong = function() {

    return currentSong;

  };

};

function handleError(err) {
  console.log('Ran into error %s', err);
}

module.exports = PlaylistManager;
