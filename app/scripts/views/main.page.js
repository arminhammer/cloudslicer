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

    ctrl.sourceEditorController = new SourceEditor.controller({
      template: options.template
    });

    ctrl.guiEditorController = new GuiEditor.controller({
      template: options.template
    });

    ctrl.handleSplitter = function(element, isInitialized, context) {

      if (isInitialized) {
        return;
      }

      console.log('Initializing splitter...');
      $(element).splitter();

    }

  },

  view: function(controller) {
    console.log('From the view:');
    console.log(controller.template);
    return [
      [m(".container-fluid#mainContainer", [
        m("nav.navbar.navbar-default", [
          m(".container", [
            m(".navbar-header", [
              m("button.navbar-toggle.collapsed[aria-controls='navbar'][aria-expanded='false'][data-target='#navbar'][data-toggle='collapse'][type='button']", [
                m("span.sr-only", "Toggle navigation"),
                m("span.icon-bar"),
                m("span.icon-bar"),
                m("span.icon-bar")
              ]),
              m("a.navbar-brand[href='#']", "Project name")
            ]),
            m(".navbar-collapse.collapse[id='navbar']", [
              m("ul.nav.navbar-nav", [
                m("li.active", [m("a[href='#']", "Home")]),
                m("li", [m("a[href='#about']", "About")]),
                m("li", [m("a[href='#contact']", "Contact")]),
                m("li.dropdown", [
                  m("a.dropdown-toggle[aria-expanded='false'][aria-haspopup='true'][data-toggle='dropdown'][href='#'][role='button']", ["Dropdown ",m("span.caret")]),
                  m("ul.dropdown-menu", [
                    m("li", [m("a[href='#']", "Action")]),
                    m("li", [m("a[href='#']", "Another action")]),
                    m("li", [m("a[href='#']", "Something else here")]),
                    m("li.divider[role='separator']"),
                    m("li.dropdown-header", "Nav header"),
                    m("li", [m("a[href='#']", "Separated link")]),
                    m("li", [m("a[href='#']", "One more separated link")])
                  ])
                ])
              ]),
              m("ul.nav.navbar-nav.navbar-right", [
                m("li", [m("a[href='../navbar/']", "Default")]),
                m("li.active", [m("a[href='./']", ["Static top ",m("span.sr-only", "(current)")])]),
                m("li", [m("a[href='../navbar-fixed-top/']", "Fixed top")])
              ])
            ])
          ])
        ]),
        //m('.container-fluid#editorContainer', { config: controller.handleSplitter }, [
          m('.container-fluid#editorContainer', [
          m('.row', [
            m(".col-md-6", [
              //m('div', 'Source'),
              SourceEditor.view(controller.sourceEditorController),
            ]),
            m(".col-md-6", [
              //m('div', 'Visual'),
              GuiEditor.view(controller.guiEditorController)
            ])
          ])
        ])
        //m(".footer", [
        //  m("p", "By Armin Graf")
        //])
      ])]
    ]
  }

};

module.exports = MainPage;
