/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var VideoModel = require('../models/video.model');

var GuiEditor = {
  controller: function(options) {
    return {
      template: options.template,

      drawEditor: function (element, isInitialized, context) {

        if (isInitialized) {
          return;
        }

        var s = Snap(element);

        var bigCircle = s.circle(150, 150, 100);

        bigCircle.attr({
          fill: "#bada55",
          stroke: "#000",
          strokeWidth: 5
        });

        /*
         var editor = CodeMirror(element, {
         value: options.template(),
         lineNumbers: true,
         mode: 'application/json',
         gutters: ['CodeMirror-lint-markers'],
         lint: true,
         styleActiveLine: true,
         autoCloseBrackets: true,
         matchBrackets: true,
         theme: 'zenburn'
         });

         editor.on('change', function(editor) {
         m.startComputation();
         options.template(editor.getValue());
         m.endComputation();
         });
         */
      }

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

    /*
     var drawGUI = function() {
     var s = Snap('');

     var bigCircle = s.circle(150, 150, 100);

     bigCircle.attr({
     fill: "#bada55",
     stroke: "#000",
     strokeWidth: 5
     });

     return m('svg',s);
     };
     */

    return [
      m('#guiContainer', [
        m('svg#guiEditor', { config: controller.drawEditor })
      ])
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
