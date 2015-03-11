/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Video = require('../api/video/video.model');
var User = require('../api/user/user.model');

Video.find({}).remove(function() {
  Video.create({
    title : 'Summertime Sadness',
    videoId: 'nVjsGKrE6E8'
  }, {
    title : 'Party and Bullshit',
    videoId: 'rEaPDNgUPLE'
  }, {
    title : 'Changes',
    videoId: 'nay31hvEvrY'
  });
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
