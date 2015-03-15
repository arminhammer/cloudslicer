/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Video = require('../api/video/video.model');
var User = require('../api/user/user.model');

Video.find({}).remove(function() {
  Video.create({
    title : 'Jesus Christ Superstar (1973) Gethsemane (14HQ) [WS] {HQ} (((Stereo)))',
    videoId: 'I3mFBh2z9sc',
    sources: [
      {src: 'https://www.youtube.com/watch?v=I3mFBh2z9sc'}
    ]
  }, {
    title : 'Jaymes Young - Moondust (Sound Remedy Remix)',
    videoId: 'liwCcSH9xzw',
    sources: [
      {src: 'https://www.youtube.com/watch?v=liwCcSH9xzw'}
    ]
  }, {
    title : 'Syndicate - Nero Remix',
    videoId: 'cSFDAB1ItpU',
    sources: [
      {src: 'https://www.youtube.com/watch?v=cSFDAB1ItpU'}
    ]
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
