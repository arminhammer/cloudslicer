/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var VideoModel = require('../models/video.model');

var GuiEditor = {
  controller: function(options) {
    return {
      /*
      list: options.list,
      initPlayer: function (element, isInitialized, context) {

        if (isInitialized) {
          return;
        }

        videojs(element, {
          "techOrder": ["youtube"],
          "src": "http://www.youtube.com/watch?v=QcIy9NiNbmo"
        }).ready(function () {
          this.one('ended', function () {
            this.src('http://www.youtube.com/watch?v=g_uoH6hJilc');
            this.play();
          });
        });

      }
      */
    }
  },
  view: function(controller) {
    return [

      /*
      m('div', [
        m('h1', 'Video')
      ]),
      m('video#videoPlayer[controls]', {
        src:'',
        class:'video-js vjs-default-skin',
        muted:'muted',
        //autoplay:'autoplay',
        preload:'auto',
        width:'640',
        height:'360',
        config: controller.initPlayer
      })
      */
    ]
  }
};

module.exports = GuiEditor;
