/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var VideoList = require('../components/video.list');
//var VideoPlayer = require('../components/video.player');

var MainPage = {

  controller: function(options) {

    var ctrl = this;

    //var list = options.list;

    ctrl.template = options.template;
    console.log('From Controller:');
    console.log(options.template);
    //var template = JSON.parse(testData);

    /*
    ctrl.playerController = new VideoPlayer.controller({
      list: list
    });

    ctrl.listController = new VideoList.controller({
      list: list
    });
    */

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
            m('div', [
              _.map(controller.template.Resources, function(value, key) {
                return m('div', value.Type)
              })
            ])
          ]),
          m(".col-md-6", [
            m('div', 'Visual')
            //VideoPlayer.view(controller.playerController)
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
