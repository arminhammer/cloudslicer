/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Song = require('../api/song/song.model');
var User = require('../api/user/user.model');
var Playlist = require('../api/playlist/playlist.model');
var Playlog = require('../api/playlog/playlog.model');
var Chat = require('../api/chat/chat.model');
var Vote = require('../api/vote/vote.model');

Song.find({}).remove(function() {
  Song.create(
    {
      title: 'Summertime Sadness',
      artist: 'Lana Del Rey',
      source: 'youtube',
      length: 283000,
      url: 'https://www.youtube.com/watch?v=TdrL3QxjyVw',
      videoId: 'TdrL3QxjyVw',
      //votes: 20,
      thumbnailUrlHigh: 'https://i.ytimg.com/vi/TdrL3QxjyVw/hqdefault.jpg'
    },
    {
      title: 'Moondust (Sound Remedy Remix)',
      artist: 'Jaymes Young',
      source: 'youtube',
      length: 360000,
      url: 'https://www.youtube.com/watch?v=liwCcSH9xzw',
      videoId: 'liwCcSH9xzw',
      //votes: 50,
      thumbnailUrlHigh: 'https://i.ytimg.com/vi/liwCcSH9xzw/hqdefault.jpg'
    },
    {
      title: 'Benediction',
      artist: 'Hot Natured & Ali Love',
      source: 'youtube',
      length: 393000,
      url: 'https://www.youtube.com/watch?v=PXx1CLAJ-OA',
      videoId: 'PXx1CLAJ-OA',
      //votes: 40,
      thumbnailUrlHigh: 'https://i.ytimg.com/vi/PXx1CLAJ-OA/hqdefault.jpg'
    },
    {
      title: 'Stonehenge',
      artist: 'Ylvis',
      source: 'youtube',
      length: 235000,
      url: 'https://www.youtube.com/watch?v=mbyzgeee2mg',
      videoId: 'mbyzgeee2mg',
      //votes: 10,
      thumbnailUrlHigh: 'https://i.ytimg.com/vi/mbyzgeee2mg/hqdefault.jpg'
    },
    {
      title: 'Feels Like We Only Go Backwards',
      artist: 'Tame Impala',
      source: 'youtube',
      length: 201000,
      url: 'https://www.youtube.com/watch?v=wycjnCCgUes',
      videoId: 'wycjnCCgUes',
      //votes: 39,
      thumbnailUrlHigh: 'https://i.ytimg.com/vi/wycjnCCgUes/hqdefault.jpg'
    }, function(err) {
      console.log('The error is %s', err);
    })
});

Playlist.find({}).remove(function() {

});

Playlog.find({}).remove(function() {

});

Vote.find({}).remove(function() {

});

Chat.find({}).remove(function() {
  Chat.create({
      date: Date.now(),
      body: 'This is a test chat 1'
    },
    {
      date: Date.now(),
      body: 'This is a test chat 2'
    },
    function() {
      console.log('Finished inserting chats.');
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
