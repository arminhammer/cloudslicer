/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Song = require('../api/song/song.model');
var User = require('../api/user/user.model');

Song.find({}).remove(function() {
  Song.create({
      title : 'Development Tools',
      info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspect.',
      inPlaylist: false,
      votes: 0
    }, {
      title : 'Server and Client integration',
      info : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.',
      inPlaylist: false,
      votes: 0
    }, {
      title : 'Smart Build System',
      info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic',
      inPlaylist: false,
      votes: 0
    },  {
      title : 'Modular Structure',
      info : 'Best practice client and server structures allow for more code reusability and maximum scalability',
      inPlaylist: false,
      votes: 0
    },  {
      title : 'Optimized Build',
      info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images.',
      inPlaylist: false,
      votes: 0
    },{
      title : 'Deployment Ready',
      info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators',
      inPlaylist: false,
      votes: 0
    },
    {
      title : 'Song 7',
      info : 'The seventh song',
      inPlaylist: true,
      votes: 0
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
