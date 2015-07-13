/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var VideoModel = require('../models/video.model');

//var svgPath = '/resources/AWS_Simple_Icons_svg_eps';
//var ec2Instance = svgPath + '/Compute & Networking/SVG/Compute & Networking_Amazon EC2 Instance.svg';

var GuiEditor = {
  controller: function(options) {
    return {
      template: options.template,

      drawEditor: function (element, isInitialized, context) {

        //if (isInitialized) {
        //  return;
        //}

        console.log('Drawing...');

        var parsed;

        try {
          parsed = JSON.parse(options.template());

          var s = Snap(element);

          /*
          var bigCircle = s.circle(100, 100, 10);

          bigCircle.attr({
            fill: "#bada55",
            stroke: "#000",
            strokeWidth: 5
          });
          */

          var ec2icon = require('../../resources/AWS_Simple_Icons_svg_eps/Compute & Networking/SVG/Compute & Networking_Amazon EC2--.svg');

          var instanceFragment1 = Snap.parse(ec2icon);
          var instanceEl1 = instanceFragment1.select('svg');
          instanceEl1.attr({
            x:200,
            y:200
          });

          var instanceFragment2 = Snap.parse(ec2icon);
          var instanceEl2 = instanceFragment2.select('svg');
          instanceEl2.attr({
            x:300,
            y:200
          });

          s.append(instanceEl1);
          s.append(instanceEl2);
          instanceEl1.drag();

        }
        catch(e) {
          console.log('Parse error: ' + e);
        }

        console.log('parsed is ' + parsed);

        /*
        if(parsed) {



        }
        */

        //var g = svg1.select('g[id=Layer_1]');
        //g.drag();
        //s.append(svg2);
        //Snap.load(ec2icon, function(f) {
        //  s.append(f);
        //})
        //console.log('Icon: ' + ec2icon);

        //Snap.load(ec2Instance, function(svg) {
          //f.select("polygon[fill='#09B39C']").attr({fill: "#bada55"});

          //var instance = svg;
          //var g = instance.selectAll('path');
          //s.append(instance);
          //g.drag();

          //s.append(f);
          //s.append(f);

        //});

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

    return [
      m('#guiContainer', [
        m('svg#guiEditor', { config: controller.drawEditor })
      ])

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
