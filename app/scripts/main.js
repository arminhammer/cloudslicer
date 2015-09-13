
'use strict';

var MainPage = require('./views/main.page');

var SourceEditor = require('./components/source.editor');


var testData = require('./testData/wordpress.template.json');

var template = m.prop(JSON.stringify(testData, undefined, 2));

m.route.mode = 'hash';

m.route(document.getElementById('code-bar'), '/', {
  '/': m.component(SourceEditor, {
    template: template
  })
});

m.route(document.getElementById('cloudslicer-app'), '/', {
  '/': m.component(MainPage, {
    template: template
  })
});
