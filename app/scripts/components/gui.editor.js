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

var svgCache = {
  ec2instances: {}
};

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
      svgCache.ec2instances[key] = fragment.select('svg');
      var xVal = (key + 1) * 100;

      svgCache.ec2instances[key].attr({
        x: ((paperCoordinates.x/(index.length+1)) * (xCount + 1)) - (parseInt(svgCache.ec2instances[key].attr('width'))/2),
        y: (((paperCoordinates.y/(index.length+1)) * rowCount) - (parseInt(svgCache.ec2instances[key].attr('height'))/2)) - 50
      });

      //animation
      function animateSVG(){
        svgCache.ec2instances[key].animate({cy: 300}, 5000,mina.bounce);
        svgCache.ec2instances[key].animate({fill:"red"},200);
      }

      //reset function?
      function resetSVG(){
        // something here to reset SVG??
      }

      svgCache.ec2instances[key].mouseover(animateSVG,resetSVG);

      console.log('Drawing at x: ' + svgCache.ec2instances[key].attr('x') + ', y: ' + svgCache.ec2instances[key].attr('y'));
      paper.append(svgCache.ec2instances[key]);
      svgCache.ec2instances[key].drag();

    });

  }
}

var GuiEditor = {
  controller: function(options) {

    return {
      template: options.template,

      drawSVGEditor: function (element, isInitialized, context) {

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

      },

      drawD3Editor: function (element, isInitialized, context) {

        var browserHeight = $('html').height();
        var browserWidth = $('html').width();

        var width = browserWidth/2;
        var height = browserHeight - 50;

        function move(d) {
          //console.log('moving...');
          //console.log(d3.event.dx);
          var select = d3.select(this);
          var oldX = parseInt(select.attr('x'));
          var oldY = parseInt(select.attr('y'));
          //console.log('x:' + oldX);
          select.attr('x', oldX + d3.event.dx);
          select.attr('y', oldY + d3.event.dy);
          //.attr('y', d3.event.dy)
        }

        var drag = d3.behavior.drag()
          //.origin(function(d) { return d; })
          //.on("dragstart", function(){
          //do some drag start stuff...
          //console.log('dragstart event');
          //})
          .on("drag", move);
        //.on("dragend", function(){
        //we're done, end some stuff
        //console.log('dragend event');
        //});

        var svg = d3.select(element).append("svg")
          .attr("width", width)
          .attr("height", height);

        d3.xml('../../resources/AWS_Simple_Icons_svg_eps/Compute & Networking/SVG/Compute & Networking_Amazon EC2--.svg', "image/svg+xml", function(xml) {
          console.log('xml');
          console.log(xml.documentElement);
          var ec2 = svg.node().appendChild(xml.documentElement);
          var ec2Sel = d3.select(ec2)
          ec2Sel.classed({'tooltip111': true, 'draggable' : true});
          d3.selectAll('.draggable').call(drag);
        });

        $(window).resize(function() {

          var browserHeight = $('html').height();
          var browserWidth = $('html').width();

          var width = browserWidth/2;
          var height = browserHeight - 50;

          svg.attr("width", width);
          svg.attr("height", height);

        });

        /*
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
         */

      },

      //drawHTMLEditor: function(element, is)

      grid: grid

    }

  },
  view: function(controller) {

    var width = controller.grid[0].length;
    var height = controller.grid.length;

    console.log('grid: ' + width + ':' + height);

    return [
      m('#guiContainer', [
        //m('#guiEditor', { config: controller.drawD3Editor })
        m('#cloudGrid', { style: { width: (width*10)+'em', height: (height*10)+'em' }}, [
        //m('#cloudGrid', [


          controller.grid.map(function(x, xkey) {
            console.log('x: ' + x);
            return m('div', [
              x.map(function(y, ykey) {
                console.log('y: ' + y);
                return m('.item', xkey + ':' + ykey);
              })
            ])
          })

        ])
      ])
    ]
  }
};

module.exports = GuiEditor;
