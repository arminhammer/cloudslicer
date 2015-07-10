/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var VideoList = require('../components/video.list');
var VideoPlayer = require('../components/video.player');

var MainPage = {

  controller: function(options) {

    var ctrl = this;

    var list = options.list;

    ctrl.playerController = new VideoPlayer.controller({
      list: list
    });

    ctrl.listController = new VideoList.controller({
      list: list
    });

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
        m('.row', [
          m(".col-lg-6", [
            VideoPlayer.view(controller.playerController)
          ])
        ]),
        m(".row", [
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
