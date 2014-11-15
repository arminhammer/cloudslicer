/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Song = require('../api/song/song.model');
var User = require('../api/user/user.model');
var Playlist = require('../api/playlist/playlist.model');
var Playlog = require('../api/playlog/playlog.model');

Song.find({}).remove(function() {
  Song.create(
    {
      title: 'Summertime Sadness',
      artist: 'Lana Del Rey',
      inPlaylist: false,
      source: 'youtube',
      length: 283000,
      url: {
        full: 'https://www.youtube.com/watch?v=TdrL3QxjyVw',
        youtubeid: 'TdrL3QxjyVw'
      },
      votes: {
        current: 0,
        total: 20
      }
    },
    {
      title: 'Moondust (Sound Remedy Remix)',
      artist: 'Jaymes Young',
      inPlaylist: false,
      source: 'youtube',
      length: 360000,
      url: {
        full: 'https://www.youtube.com/watch?v=liwCcSH9xzw',
        youtubeid: 'liwCcSH9xzw'
      },
      votes: {
        current: 0,
        total: 50
      }
    },
    {
      title: 'Benediction',
      artist: 'Hot Natured & Ali Love',
      inPlaylist: false,
      source: 'youtube',
      length: 393000,
      url: {
        full: 'https://www.youtube.com/watch?v=PXx1CLAJ-OA',
        youtubeid: 'PXx1CLAJ-OA'
      },
      votes: {
        current: 0,
        total: 40
      }
    },
    {
      title: 'Stonehenge',
      artist: 'Ylvis',
      inPlaylist: false,
      source: 'youtube',
      length: 235000,
      url: {
        full: 'https://www.youtube.com/watch?v=mbyzgeee2mg',
        youtubeid: 'mbyzgeee2mg'
      },
      votes: {
        current: 0,
        total: 10
      }
    },
    {
      title: 'Feels Like We Only Go Backwards',
      artist: 'Tame Impala',
      inPlaylist: false,
      source: 'youtube',
      length: 201000,
      url: {
        full: 'https://www.youtube.com/watch?v=wycjnCCgUes',
        youtubeid: 'wycjnCCgUes'
      },
      votes: {
        current: 0,
        total: 39
      }
    })
});

Playlist.find({}).remove(function() {

});

Playlog.find({}).remove(function() {

});
  /*

  var songCount = 0;

  Song.count({}, function(err, count) {
    songCount = count;
  });

  Song.find({}).select('title').exec(function(err, titles) {

    console.log(titles);

    var randomSong1Count = Math.floor(Math.random() * (songCount - 0)) + 0;
    var randomSong2Count = Math.floor(Math.random() * (songCount - 0)) + 0;

    console.log('Numbers are %d and %d', randomSong1Count, randomSong2Count);

    var song1ID = titles[randomSong1Count]._id;
    var song2ID = titles[randomSong2Count]._id;

    console.log('IDs are: %s and %s', song1ID, song2ID);

    //var song1 = Song.find({ titles[randomSong1Count] }).exec(function() {});
    //var song2 = Song.find({ titles[randomSong2Count] }).exec(function() {});

    //console.log(song1);
    //console.log(song2);

    Playlist.create({
      current: 0,
      tracks: [
        song1ID,
        song2ID
      ]
    }, function() {
      console.log('Playlist created.');
    });

  });



//console.log('All songs are length %d', allSongs.length);
//console.log(allSongs);

})
 */

User.find({}).remove(function() {
  User.create({
      provider: 'local',
      name: 'Test User',
      email: 'test@test.com',
      password: 'test'
    }, {
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin'
    }, function() {
      console.log('finished populating users');
    }
  );
});
