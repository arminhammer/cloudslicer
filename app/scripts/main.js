'use strict';

var MainPage = require('./views/main.page');

var SourceEditor = require('./components/source.editor');
var PixiEditor = require('./components/pixi.editor');

var testData = require('./testData/wordpress.template.json');

var template = m.prop(JSON.stringify(testData, undefined, 2));

m.mount(document.getElementById('cloudslicer-app'), m.component(PixiEditor, {
    template: template
  })
);

m.mount(document.getElementById('code-bar'), m.component(SourceEditor, {
    template: template
  })
);
