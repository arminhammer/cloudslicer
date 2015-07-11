/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var SourceEditor = require('../components/source.editor');
var GuiEditor = require('../components/gui.editor');

var MainPage = {

  controller: function(options) {

    var ctrl = this;

    //var list = options.list;

    ctrl.template = options.template;
    console.log('From Controller:');
    console.log(options.template);
    //var template = JSON.parse(testData);

    ctrl.sourceEditorController = new SourceEditor.controller({
      template: options.template
    });

    ctrl.guiEditorController = new GuiEditor.controller({

    });

  },

  view: function(controller) {
    console.log('From the view:');
    console.log(controller.template);
    return [
      [m(".container", [
        m(".header", [
          m("ul.nav.nav-pills.pull-right", [
            m("li.active", [m("a[href='#']", "Home")]),
            m("li", [m("a[href='#']", "About")]),
            m("li", [m("a[href='#']", "Contact")])
          ]),
          m("h3.text-muted", "Cloudslicer")
        ]),
        m('.row', [
          m(".col-md-6", [
            m('div', 'Source'),
            SourceEditor.view(controller.sourceEditorController),
          ]),
          m(".col-md-6", [
            m('div', 'Visual'),
            GuiEditor.view(controller.playerController)
          ])
        ]),
        m(".footer", [
          m("p", "By Armin Graf")
        ])
      ])]
    ]
  }

};

module.exports = MainPage;
