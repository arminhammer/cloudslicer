
'use strict';

var MainPage = require('./views/main.page');

m.route.mode = 'hash';

m.route(document.getElementById('beatsch-app'), '/', {
  '/': m.component(MainPage, {
  })
});
