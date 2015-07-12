/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var VideoModel = require('../models/video.model');

var GuiEditor = {
  controller: function(options) {
    return {
      template: options.template
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
    var parsed = null;
    var sourceBlock = null;

    try {
      parsed = JSON.parse(controller.template());
      sourceBlock =   [
        m('div', [
          _.map(parsed.Resources, function (value, key) {
            return m('div', value.Type)
          })
        ]),
        m('div', [
          parsed.Parameters.InstanceType.AllowedValues.map(function(value) {
            return m('div', value)
          })
        ])
      ]
    }
    catch(e) {
      console.log('Parse error: ' + e);
      sourceBlock =   m('div', {}, e)
    }
    return [
      sourceBlock
      /*
       */

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
