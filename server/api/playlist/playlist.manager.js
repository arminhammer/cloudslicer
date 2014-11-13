/**
 * Created by armin on 11/9/14.
 */

var Playlist = require('./playlist.model');
var Song = require('../song/song.model');

var PlaylistManager = function() {

  var manager = null;
  var currentSong = {};

  //console.log('Playlist length: %d', tracks.length);

  this.refill = function(max) {

    console.log('Refilling playlist');

    Playlist.find({}, function(err, tracks) {
      console.log('Found %d tracks', tracks.length);
      if(tracks.length < 1) {

        console.log('Playlist is empty.');

        Song.find({})
          .sort('-votes.total')
          .limit(max)
          .exec(function(err, songs) {

            Playlist.create({ position: 0, song: songs[0]._id, playing: true }, function(err, newTrack) {
              if (err) return handleError(err);
              console.log('Adding %s to playlist.', newTrack);
            });

            currentSong.track = songs[0];
            currentSong.position = 0;

            console.log('Found %d songs to add', songs.length);
            for(var i = 1; i < songs.length; i++) {
              Playlist.create({ position: i, song: songs[i]._id, playing: false }, function(err, newTrack) {
                if (err) return handleError(err);
                console.log('Adding %s to playlist.', newTrack);
              });

            }

          });

      }

    });

  };

  this.start = function() {

    manager = setInterval(manage, 1000);

  };

  this.stop = function() {

    clearInterval(manager);
    manager = null;

  };


  function compareTracks(a, b) {

    return b.votes.current- a.votes.current;

  }

  function manage() {

    console.log('Managing');
    var playlistLength = 0;

    Playlist.find({}, function(err, tracks) {

      //console.log('Manage found %d tracks', tracks.length);
      //playlistLength = tracks.length;
      //console.log('Playlist length 1: %d', playlistLength);

        if (currentSong.position <= currentSong.track.tLength) {
          currentSong.position += 1000;
          console.log('%s now at %d of %d', currentSong.track.title, currentSong.position, currentSong.track.tLength);
        }
        else {

          Playlist.findById(currentSong.track._id, function (err, playlist) {

            if(err) { console.log(err); }

            if(!playlist) {

              console.log('Can\'t find currentTrack in the playlist!');

            }

            playlist.remove(function(err) {

              if (err) {
                console.log(err);
              }

              console.log('Removed %s from the playlist.', playlist);

              Playlist.find({})
                .sort('-votes')
                .limit(1)
                .exec(function (err, song) {

                  currentSong.track = song[0];
                  currentSong.position = 0;

                });

            });

          });

        }

    });

  }

  this.addTrack = function(track) {

    tracks.push(track);
    console.log('track %s added to the playlist', track);

  };

  this.getTrackList = function() {

    return tracks;

  };


  this.currentSong = function() {

    return currentSong;

  };

};

function handleError(err) {
  console.log('Ran into error %s', err);
}

module.exports = PlaylistManager;
