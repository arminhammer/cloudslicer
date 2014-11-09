/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Song = require('../api/song/song.model');
var User = require('../api/user/user.model');

Song.find({}).remove(function() {
  Song.create(
    {
      title: 'Summertime Sadness',
      artist: 'Lana Del Rey',
      inPlaylist: false,
      source: 'youtube',
      url: {
        full: 'https://www.youtube.com/watch?v=TdrL3QxjyVw',
        youtubeid: 'TdrL3QxjyVw'
      },
      votes: {
        current: 0,
        total: 0
      }
    },
    {
      title: 'Moondust (Sound Remedy Remix)',
      artist: 'Jaymes Young',
      inPlaylist: false,
      source: 'youtube',
      url: {
        full: 'https://www.youtube.com/watch?v=liwCcSH9xzw',
        youtubeid: 'liwCcSH9xzw'
      },
      votes: {
        current: 0,
        total: 0
      }
    },
    {
      title: 'Benediction',
      artist: 'Hot Natured & Ali Love',
      inPlaylist: false,
      source: 'youtube',
      url: {
        full: 'https://www.youtube.com/watch?v=PXx1CLAJ-OA',
        youtubeid: 'PXx1CLAJ-OA'
      },
      votes: {
        current: 0,
        total: 0
      }
    },
    {
      title: 'Stonehenge',
      artist: 'Ylvis',
      inPlaylist: false,
      source: 'youtube',
      url: {
        full: 'https://www.youtube.com/watch?v=mbyzgeee2mg',
        youtubeid: 'mbyzgeee2mg'
      },
      votes: {
        current: 0,
        total: 0
      }
    },
    {
      title: 'Feels Like We Only Go Backwards',
      artist: 'Tame Impala',
      inPlaylist: false,
      source: 'youtube',
      url: {
        full: 'https://www.youtube.com/watch?v=wycjnCCgUes',
        youtubeid: 'wycjnCCgUes'
      },
      votes: {
        current: 0,
        total: 0
      }
    })
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
