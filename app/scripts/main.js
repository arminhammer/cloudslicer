'use strict';

var SourceEditor = require('./components/source.editor');
var PixiEditor = require('./components/pixi.editor');

var testData = require('./testData/empty.json');

var template = m.prop(testData);

m.mount(document.getElementById('cloudslicer-app'), m.component(PixiEditor, {
    template: template
  })
);

m.mount(document.getElementById('code-bar'), m.component(SourceEditor, {
    template: template
  })
);
