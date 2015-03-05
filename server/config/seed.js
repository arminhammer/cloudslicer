/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Video = require('../api/video/video.model');
var User = require('../api/user/user.model');

Video.find({}).remove(function() {
  Video.create({
    title : 'Song 1',
    url : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.'
  }, {
    title : 'Song 2',
    url : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'
  }, {
    title : 'Song 3',
    url : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
  },  {
    title : 'Song 4',
    url : 'Best practice client and server structures allow for more code reusability and maximum scalability'
  },  {
    title : 'Song 5',
    url : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
  },{
    title : 'Song 6',
    url : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
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
