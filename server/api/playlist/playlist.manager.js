/**
 * Created by armin on 11/9/14.
 */

var Playlist = require('./playlist.model');
var Song = require('../song/song.model');

var PlaylistManager = function() {

  var manager = null;
  var currentSong = null;
  var votingPeriod = 1000;
  var countInterval = 1000;
  var timer = 0;

  //console.log('Playlist length: %d', tracks.length);

  function getCurrentPosition(callback) {

    Playlist.find({})
      .sort('-position')
      .limit(1)
      .exec(function(err, position) {

        console.log('POSITION');
        console.log(position);

        var value = 0;

        if(position.length >= 1) {
          value = position[0].position;
        }

        console.log('Current Position of playlist is %d', value);

        callback(value);

      });

  }

  function refill(max, callback) {

    console.log('Refilling playlist');

    Playlist.find({ played: 0 }, function(err, tracks) {
      console.log('Found %d tracks', tracks.length);
      if(tracks.length < 1) {

        console.log('Playlist is empty.');

        var currentPosition = 0;
        var nextPosition = 0;
        getCurrentPosition(function(currentValue) {


          console.log('CURRENT VAL: %d', currentValue);
          currentPosition = currentValue;
          nextPosition = currentPosition++;

        });

        console.log('CURRENT IS %d, NEXT IS %d', currentPosition, nextPosition);

        Song.find({})
          .sort('-votes.total')
          .limit(max)
          .exec(function(err, songs) {

            Playlist.create({ position: 0, _song: songs[0], played: 1, votes: 0 }, function(err, newTrack) {

              if (err) return handleError(err);
              console.log('Adding %s to playlist.', newTrack);

              currentSong.playlist = newTrack;

              console.log('currentSong is');
              console.log(currentSong.playlist._song);

              newTrack.save(function() {});

            });


            function announceAdd(err, newTrack) {

              if (err) return handleError(err);

              console.log('Adding %s to playlist.', newTrack);
              newTrack.save(function() {});

            }

            console.log('Found %d songs to add', songs.length);
            for(var i = 1; i < songs.length; i++) {
              Playlist.create({ position: 0, _song: songs[i]._id, played: 0, votes: 0 }, announceAdd)

            }

          });

      }

    });

    callback();

  }

  this.start = function() {

    currentSong = {};
    refill(40, function() {

      manager = setInterval(manage, countInterval);

    });

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

    //console.log('currentSong is %s, position %d of %d', currentSong.track.title, currentSong.position, currentSong.track.length);

    //Change the track to vote on every  2 minutes
    if (timer <= votingPeriod) {
      timer += countInterval;
      console.log('%s, votingPeriod now at %d of %d', currentSong.playlist._song.title, timer, votingPeriod);
      console.log('playlist id is %s', currentSong.playlist._id);
    }
    else {

      var nextPosition = 0;
      getCurrentPosition(function(currentValue) {

        console.log('CURRENT VAL: %d', currentValue);
        nextPosition = currentValue++;

      });

      Playlist.findOneAndUpdate( { _id: currentSong.playlist._id }, { position: nextPosition, played: 2 }, function (err, pTrack) {

        if(err) { console.log(err); }

        if(!pTrack) {

          console.log('Can\'t find currentTrack in the playlist!');
          return;

        }

        Playlist.find({ played: 0 })
          .sort('-votes')
          .limit(1)
          .populate('_song')
          .exec(function (err, nextSong) {

            if(err) {
              console.log('There was an error: %s', err);
            }

            console.log('nextSong.length: %d', nextSong.length);
            if(nextSong.length < 1) {
              console.log('The playlist is empty!  Refilling...');
              refill(40, function() {

                timer = 0;

                Playlist.find({ played: 0})
                  .sort('-votes')
                  .limit(1)
                  .exec(function (err, nextCurrentSong) {
                    nextCurrentSong.played = 1;
                    Playlist.findOneAndUpdate( { _id: nextCurrentSong._id }, function(err, updatedSong) {

                      currentSong.playlist = updatedSong;
                      console.log('currentSong is now');
                      console.log(currentSong.playlist);

                    });


                  });

              });

            }
            else {

              console.log('currentSong will become');
              console.log(nextSong[0]);
              timer = 0;

              Playlist.findOneAndUpdate({_id: nextSong[0]._id}, {played: 1}, function (err, nextCurrentSong) {
                currentSong.playlist = nextCurrentSong;
                console.log('currentSong is now');
                console.log(currentSong.playlist);
              });

            }

            /*
             currentSong.playlist = nextSong[0];

             Song.findById(nextSong[0].song, function(err, nextSongSong) {

             if(err) { console.log(err); }

             console.log('embedded song is');
             console.log(nextSongSong);

             currentSong.track = nextSongSong;

             });
             */

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
