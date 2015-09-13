/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

function resizeGuiContainer(renderer) {
  var browserHeight = $('html').height();
  var browserWidth = $('html').width();

  console.log('Resizing...');
  console.log(browserWidth);

  $('#guiContainer').height(browserHeight);
  $('#guiContainer').width(browserWidth);

  /*if(renderer) {
    renderer.view.style.width = browserWidth+'px';
    renderer.view.style.height = browserHeight+'px';
  }*/

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


function drawGrid(width, height) {
  var grid = new PIXI.Graphics();
  var interval = 25;
  var count = interval;
  grid.lineStyle(1, 0xE5E5E5, 1);
  while (count < width) {
    grid.moveTo(count, 0);
    grid.lineTo(count, height);
    count = count + interval;
  }
  var count = interval;
  while(count < height) {
    grid.moveTo(0, count);
    grid.lineTo(width, count);
    count = count + interval;
  }
  return grid;
}

function onDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
}

function onDragEnd() {
  this.alpha = 1;

  this.dragging = false;

  // set the interaction data to null
  this.data = null;
}

function onDragMove() {
  if (this.dragging)
  {
    var global = this.toGlobal(this.parent);
    var local = this.toLocal(this.parent);
    console.log('x: ' + this.x + ' y: ' + this.y);
    console.log('this: ' + this.x+":"+this.y + ", global: " + global.x + ":" + global.y + ", local: " + local.x + ":" + local.y);
    //console.log('width: ' + this.width + ' height: ' + this.height);
    var newPosition = this.data.getLocalPosition(this.parent);
    console.log('NEW: ' + newPosition.x + ':' + newPosition.y);
    var local = this.toLocal(this.data);
    console.log('LOCAL: ' + local.x + ':' + local.y);
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;
    //this.moveTo(newPosition.x, newPosition.y);
  }
}

function onMouseOver() {
  var self = this;
  var iconSize = 10;

  console.log('Mouse over');
  var global = self.toGlobal(self.parent);
  console.log('GLOBAL: ' + global.x + ':' + global.y);

  var scaleLocations = [
    {x: -5, y: -5, size: iconSize},
    {x: elementSize-5, y: -5, size: iconSize},
    {x: -5, y: elementSize-5, size: iconSize},
    {x: elementSize-5, y: elementSize-5, size: iconSize}
  ];

  //moveIcon.drawRect(elementSize-5, -5, 10, 10);
  //moveIcon.drawRect(-5, elementSize-5, 10, 10);
  //moveIcon.drawRect(elementSize-5, elementSize-5, 10, 10);

  self.scaleIcons = [];

  scaleLocations.forEach(function(loc) {
    var icon = new PIXI.Graphics();
    icon.interactive = true;
    icon.buttonMode = true;
    icon.lineStyle(1, 0x0000FF, 1);
    icon.beginFill(0x000000, 1);
    icon.drawRect(loc.x, loc.y, loc.size, loc.size);
    icon.endFill();

    icon
      // events for drag start
      .on('mousedown', onScaleIconDragStart)
      .on('touchstart', onScaleIconDragStart);
    // events for drag end
    //.on('mouseup', onDragEnd)
    //.on('mouseupoutside', onDragEnd)
    //.on('touchend', onDragEnd)
    //.on('touchendoutside', onDragEnd)
    // events for drag move
    //.on('mousemove', onDragMove)
    //.on('touchmove', onDragMove)

    self.scaleIcons.push(icon);

  });

  //moveIcon.endFill();

  //stage.removeChild(self);
  //stage.addChild(icon);
  self.scaleIcons.forEach(function(s) {
    self.addChild(s);
  });
  //this.addChild(this.scaleIcons[0])
  //stage.addChild(this);

}

function onMouseOut() {
  var self = this;
  console.log('Mouse out');
  this.scaleIcons.forEach(function(s) {
    self.removeChild(s);
  });
  console.log('Size: ');
  console.log(this.getBounds());

}

function onScaleIconDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
  console.log('Resizing!');
}

/*
var elements = [];
var el1 = createElement('el1', 100, 100);
var el2 = createElement('el2', 200, 200);
var el3 = createElement('el3', 300, 300);
elements.push(el1);
elements.push(el2);
elements.push(el3);

elements.forEach(function(element) {
  console.log(element.name);
  console.log(element.position);
  console.log(element.height + ':' + element.width);
  stage.addChild(element);
});
*/

function draw() {

}

var PixiEditor = {
  controller: function(options) {

    var width = window.innerWidth;
    var height = window.innerHeight;

    var elementSize = 100;

    var renderer = PIXI.autoDetectRenderer(width, height,{backgroundColor : 0xFFFFFF});

    // create the root of the scene graph
    var stage = new PIXI.Container();

    stage.interactive = true;
    var meter = new FPSMeter();

    var grid = drawGrid(width, height);
    stage.addChild(grid);

    function animate() {
      renderer.render(stage);
      meter.tick();
      requestAnimationFrame(animate);
    }

    return {
      template: options.template,

      drawCanvasEditor: function (element, isInitialized, context) {

        if (isInitialized) {
          animate();
          return;
        }

        $(window).resize(function() {
          resizeGuiContainer(renderer);
          //drawSVG(paper, parsed, element, options);

        });

        resizeGuiContainer();
        //drawSVG(paper, parsed, element, options);

        element.appendChild(renderer.view);

        animate();

      }
    }
  },
  view: function(controller) {
    return m('#guiContainer', { config: controller.drawCanvasEditor})
  }
};

module.exports = PixiEditor;
