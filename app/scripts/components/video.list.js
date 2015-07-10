/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var VideoModel = require('../models/video.model');

var VideoList = {
  controller: function(options) {
    return {
      list: options.list
    };
  },
  view: function(controller) {
    console.log('Viewing...');
    console.log(controller.list.length);
    return [
      m('div', [
        m('h1', 'Playlist')
      ]),
      controller.list.map(function(v) {
        console.log(v);
        return m('div', v.title())
      })
    ]
  }
};

module.exports = VideoList;
