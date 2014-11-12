/**
 * Created by armin on 11/9/14.
 */

var Playlist = require('./playlist.model');
var Song = require('../song/song.model');

var PlaylistManager = function() {

  var tracks = [];
  var manager = null;
  var currentSong = null;

  console.log('Playlist length: %d', tracks.length);

  this.initialize = function() {

    Playlist.find({}, function(err, tracks) {
      console.log('Found %d tracks', tracks.length);
      if(tracks.length < 1) {

        console.log('Playlist is empty.');

        Song.find({})
          .sort('-votes.total')
          .limit(10)
          .exec(function(err, songs) {

            console.log('Found %d songs to add', songs.length);
            for(var i = 0; i < songs.length; i++) {
              Playlist.create({ position: i, song: songs[i]._id }, function(err, newTrack) {
                if (err) return handleError(err);
                console.log('Adding %s to playlist.', newTrack);
              });

            }

          });

      }

    });

    if(tracks.length < 1) {

    }

  }

  function compareTracks(a, b) {

    return b.votes.current- a.votes.current;

  }

  function switchTracks() {

    if(tracks.length > 0) {
      currentSong = {};
      tracks.sort(compareTracks);
      currentSong.track = tracks.shift();
      currentSong.position = 0;
      console.log('Now playing %s', currentSong.track.title);
    }
    else {

    }

  }

  this.switchTracks = function(callback) {

    switchTracks();

    callback();

  };

  var manage = function() {

    console.log('Managing');
    console.log('Playlist length: %d', tracks.length);

    if(currentSong === null) {

      switchTracks();

    }
    else {

      if (currentSong.position <= currentSong.track.tLength) {
        currentSong.position += 1000;
        console.log('%s now at %d of %d', currentSong.track.title, currentSong.position, currentSong.track.tLength);
      }
      else {
        currentSong = null;
      }

    }

  };

  // TODO
  this.refill = function() {

  };

  this.addTrack = function(track) {

    tracks.push(track);
    console.log('track %s added to the playlist', track);

  };

  this.getTrackList = function() {

    return tracks;

  };

  this.start = function() {

    manager = setInterval(manage, 1000);

  };

  this.stop = function() {

    clearInterval(manager);
    manager = null;

  };

  this.currentSong = function() {

    return currentSong;

  };

};

function handleError(err) {
  console.log('Ran into error %s', err);
}

module.exports = PlaylistManager;
