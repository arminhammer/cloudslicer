/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var VideoList = require('../components/video.list');

var MainPage = {

  controller: function(options) {

    var ctrl = this;

    var list = options.list;

    ctrl.listController = new VideoList.controller({
      list: list
    })

  },

  view: function(controller) {
    return [
      [m(".container", [
        m(".header", [
          m("ul.nav.nav-pills.pull-right", [
            m("li.active", [m("a[href='#']", "Home")]),
            m("li", [m("a[href='#']", "About")]),
            m("li", [m("a[href='#']", "Contact")])
          ]),
          m("h3.text-muted", "Beatsch")
        ]),
        m(".jumbotron", [
          m("h1", "'Allo1, 'Allo1!"),
          m("p.lead", "Always a pleasure scaffolding your apps."),
          m("p", [m("a.btn.btn-lg.btn-success[href='#']", "Splendid!")])
        ]),
        m(".row.marketing", [
          m(".col-lg-6", [
            VideoList.view(controller.listController)
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
