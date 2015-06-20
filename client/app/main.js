// main.js

'use strict';

var _ = require('underscore');
var names = ['blue t-shirt', 'yellow t-shirt', 'green t-shirt'];

_.each(names, function(n) {
	console.log(n);
});

//initialize the application

var video = {};
video.model = require('./models/Video');
video.view = require('./views/videoView');

m.module(document.getElementById("page-app"), {controller: video.controller, view: video.view});
