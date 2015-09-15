/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var DragDrop = require('./drag.drop');

function getWindowDimension() {
  return { x: window.innerWidth, y: window.innerHeight };
}

function resizeGuiContainer(renderer) {

  var dim = getWindowDimension();

  console.log('Resizing...');
  console.log(dim);

  $('#guiContainer').height(dim.y);
  $('#guiContainer').width(dim.x);

  if(renderer) {
    renderer.view.style.width = dim.x+'px';
    renderer.view.style.height = dim.y+'px';
  }

  console.log('Resizing gui container...');

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
  count = interval;
  while(count < height) {
    grid.moveTo(0, count);
    grid.lineTo(width, count);
    count = count + interval;
  }
  return grid;
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

    var winDimension = getWindowDimension();

    var renderer = PIXI.autoDetectRenderer(winDimension.x, winDimension.y,{backgroundColor : 0xFFFFFF});
    var stage = new PIXI.Container();
    var meter = new FPSMeter();

    function animate() {
      renderer.render(stage);
      meter.tick();
      requestAnimationFrame(animate);
    }

    function onLoaded() {
      console.log('Assets loaded');

      var AWS_EC2_Instance = PIXI.Sprite.fromFrame('Compute_&_Networking_Amazon_EC2--.png');
      console.log('EC2Instance');
      console.log(AWS_EC2_Instance);
      AWS_EC2_Instance.scale.set(0.2);
      AWS_EC2_Instance.position.x = 400;
      AWS_EC2_Instance.position.y = 400;
      AWS_EC2_Instance.anchor.set(0.5);
      AWS_EC2_Instance.interactive = true;
      AWS_EC2_Instance.buttonMode = true;
      AWS_EC2_Instance
        // events for drag start
        .on('mousedown', DragDrop.onDragStart)
        .on('touchstart', DragDrop.onDragStart)
        // events for drag end
        .on('mouseup', DragDrop.onDragEnd)
        .on('mouseupoutside', DragDrop.onDragEnd)
        .on('touchend', DragDrop.onDragEnd)
        .on('touchendoutside', DragDrop.onDragEnd)
        // events for drag move
        .on('mousemove', DragDrop.onDragMove)
        .on('touchmove', DragDrop.onDragMove)
        // events for mouse over
        //.on('mouseover', onMouseOver)
        //.on('mouseout', onMouseOut);
      stage.addChild(AWS_EC2_Instance);
    }

    PIXI.loader
      .add('../resources/sprites/sprites.json')
      .load(onLoaded);

    return {
      template: options.template,

      drawCanvasEditor: function (element, isInitialized, context) {

        if (isInitialized) {
          animate();
          return;
        }

        //var elementSize = 100;

        stage.interactive = true;
        var grid = stage.addChild(drawGrid(winDimension.x, winDimension.y));

        //resizeGuiContainer();

        element.appendChild(renderer.view);

        $(window).resize(function() {
          console.log('Adding listener...');
          resizeGuiContainer(renderer);
          winDimension = getWindowDimension();
          //console.log(newDim);
          console.log(stage);
          stage.removeChild(grid);
          grid = stage.addChild(drawGrid(winDimension.x, winDimension.y));
        });

        animate();

      }
    }
  },
  view: function(controller) {
    return m('#guiContainer', { config: controller.drawCanvasEditor})
  }
};

module.exports = PixiEditor;
