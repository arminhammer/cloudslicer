/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var VideoModel = require('../models/video.model');

//var svgPath = '/resources/AWS_Simple_Icons_svg_eps';
//var ec2Instance = svgPath + '/Compute & Networking/SVG/Compute & Networking_Amazon EC2 Instance.svg';

var ec2icon = require('../../resources/AWS_Simple_Icons_svg_eps/Compute & Networking/SVG/Compute & Networking_Amazon EC2--.svg');

function resizeGuiContainer() {
  var browserHeight = $('html').height();
  var browserWidth = $('html').width();

  console.log('Resizing...');
  console.log(browserWidth);

  $('#guiContainer').height(browserHeight - 50);
  $('#guiContainer').width(browserWidth/2);

  //console.log('Resizing gui container...');

}

function drawSVG(paper, parsed, element, options) {

  console.log('Drawing...');

  try {
    parsed = JSON.parse(options.template());
  }
  catch (e) {
    console.log('Parse error: ' + e);
    paper = Snap(element);
    if (paper) {
      console.log('Clearing bc of error...');
      paper.clear();
    }
  }

  console.log('parsed is ' + parsed);

  console.log($(element));

  if (parsed) {

    paper = Snap(element);
    paper.clear();

    console.log(parsed.Resources);

    var ec2instances = _.filter(parsed.Resources, function (resource) {
      return resource.Type === 'AWS::EC2::Instance'
    });

    console.log(ec2instances);

    var paperCoordinates = {
      x: $(element).width(),
      y: $(element).height()
    };

    console.log('Coordinates:');
    console.log(paperCoordinates);

    var rowCount = 0;

    ec2instances.forEach(function (ec2, key, index) {

      var xCount = key % 2;
      if(xCount === 0) {
        rowCount++;
      }

      console.log('Index:');
      console.log('xCount=' + xCount + ' and rowCount=' + rowCount);
      //console.log(paperCoordinates.x/(index.length+1));

      var fragment = Snap.parse(ec2icon);
      var element = fragment.select('svg');
      var xVal = (key + 1) * 100;

      element.attr({
        x: ((paperCoordinates.x/(index.length+1)) * (xCount + 1)) - (parseInt(element.attr('width'))/2),
        y: (((paperCoordinates.y/(index.length+1)) * rowCount) - (parseInt(element.attr('height'))/2)) - 50
      });

      console.log('Drawing at x: ' + element.attr('x') + ', y: ' + element.attr('y'));
      paper.append(element);
      element.drag();

    });

  }
}

var GuiEditor = {
  controller: function(options) {
    return {
      template: options.template,

      drawEditor: function (element, isInitialized, context) {

        var parsed = null;
        var paper = null;

        if (isInitialized) {
          resizeGuiContainer();
          drawSVG(paper, parsed, element, options);
          return;
        }

        resizeGuiContainer();

        $(window).resize(function() {
          resizeGuiContainer();
          drawSVG(paper, parsed, element, options);
        });

        drawSVG(paper, parsed, element, options);

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
