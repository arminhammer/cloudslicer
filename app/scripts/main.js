
'use strict';

var MainPage = require('./views/main.page');
//var VideoModel = require('./models/video.model');

var testData = require('./testData/wordpress.template.json');

m.route.mode = 'hash';

m.route(document.getElementById('cloudslicer-app'), '/', {
  '/': m.component(MainPage, {
    template: testData
  })
});
