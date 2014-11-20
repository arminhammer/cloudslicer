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
      source: 'youtube',
      length: 283000,
      url: 'https://www.youtube.com/watch?v=TdrL3QxjyVw',
      videoId: 'TdrL3QxjyVw',
      votes: 20
    },
    {
      title: 'Moondust (Sound Remedy Remix)',
      artist: 'Jaymes Young',
      source: 'youtube',
      length: 360000,
      url: 'https://www.youtube.com/watch?v=liwCcSH9xzw',
      videoId: 'liwCcSH9xzw',
      votes: 50
    },
    {
      title: 'Benediction',
      artist: 'Hot Natured & Ali Love',
      source: 'youtube',
      length: 393000,
      url: 'https://www.youtube.com/watch?v=PXx1CLAJ-OA',
      videoId: 'PXx1CLAJ-OA',
      votes: 40
    },
    {
      title: 'Stonehenge',
      artist: 'Ylvis',
      source: 'youtube',
      length: 235000,
      url: 'https://www.youtube.com/watch?v=mbyzgeee2mg',
      videoId: 'mbyzgeee2mg',
      votes: 10
    },
    {
      title: 'Feels Like We Only Go Backwards',
      artist: 'Tame Impala',
      source: 'youtube',
      length: 201000,
      url: 'https://www.youtube.com/watch?v=wycjnCCgUes',
      videoId: 'wycjnCCgUes',
      votes: 39
    },
    function() {
      console.log('finished populating songs');
    });
});

Playlist.find({}).remove(function() {

});

Playlog.find({}).remove(function() {

});

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
