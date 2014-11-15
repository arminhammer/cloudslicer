/**
 * Created by armin on 11/9/14.
 */

var Playlist = require('./playlist.model');
var Song = require('../song/song.model');

var PlaylistManager = function() {

  var manager = null;
  var currentSong = null;
  var votingPeriod = 120000;
  var countInterval = 1000;

  //console.log('Playlist length: %d', tracks.length);

  function refill(max) {

    console.log('Refilling playlist');

    Playlist.find({}, function(err, tracks) {
      console.log('Found %d tracks', tracks.length);
      if(tracks.length < 1) {

        console.log('Playlist is empty.');

        Song.find({})
          .sort('-votes.total')
          .limit(max)
          .exec(function(err, songs) {

            Playlist.create({ position: 0, song: songs[0], playing: true }, function(err, newTrack) {
              if (err) return handleError(err);
              console.log('Adding %s to playlist.', newTrack);

              currentSong.track = songs[0];
              currentSong.timer = 0;
              currentSong.playlist = newTrack;

              console.log('currentSong is');
              console.log(currentSong.track);

            });


            function announceAdd(err, newTrack) {
              if (err) return handleError(err);
              console.log('Adding %s to playlist.', newTrack);
            }

            console.log('Found %d songs to add', songs.length);
            for(var i = 1; i < songs.length; i++) {
              Playlist.create({ position: i, song: songs[i]._id, playing: false }, announceAdd)

            }

          });

      }

    });

  }

  this.start = function() {

    currentSong = {};
    refill(40);
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

    /*
     Playlist.find({}, function(err, tracks) {

     //console.log('Manage found %d tracks', tracks.length);
     //playlistLength = tracks.length;
     //console.log('Playlist length 1: %d', playlistLength);
     });
     */

    console.log('currentSong is %s, position %d of %d', currentSong.track.title, currentSong.position, currentSong.track.length);

    //Change the track to vote on every  2 minutes
    if (currentSong.timer <= votingPeriod) {
      currentSong.timer += countInterval;
      console.log('%s, votingPeriod now at %d of %d', currentSong.track.title, currentSong.timer, votingPeriod);
      console.log('playlist id is %s', currentSong.playlist._id);
    }
    else {

      Playlist.remove( { _id: currentSong.playlist._id }, function (err, pTrack) {

        if(err) { console.log(err); }

        if(!pTrack) {

          console.log('Can\'t find currentTrack in the playlist!');
          return;

        }

        Playlist.find({})
          .sort('-votes')
          .limit(1)
          .exec(function (err, nextSong) {

            console.log('currentSong will become');
            console.log(nextSong);

            currentSong.timer = 0;
            currentSong.playlist = nextSong[0];

            Song.findById(nextSong[0].song, function(err, nextSongSong) {

                if(err) { console.log(err); }

                console.log('embedded song is');
                console.log(nextSongSong);

                currentSong.track = nextSongSong;

              });

          });
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
