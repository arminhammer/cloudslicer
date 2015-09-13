/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

function resizeGuiContainer() {
  var browserHeight = $('html').height();
  var browserWidth = $('html').width();

  console.log('Resizing...');
  console.log(browserWidth);

  $('#guiContainer').height(browserHeight);
  $('#guiContainer').width(browserWidth);

  console.log('Resizing gui container...');

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

var PixiEditor = {
  controller: function(options) {

    return {
      template: options.template,

      drawCanvasEditor: function (element, isInitialized, context) {

        if (isInitialized) {
          return;
        }

        $(window).resize(function() {
          resizeGuiContainer();
          //drawSVG(paper, parsed, element, options);
        });

        resizeGuiContainer();
        //drawSVG(paper, parsed, element, options);

      }
    }
  },
  view: function(controller) {
    return m('#guiContainer', { config: controller.drawCanvasEditor})
  }
};

module.exports = PixiEditor;
