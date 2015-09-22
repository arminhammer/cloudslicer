/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var GuiUtil = require('./gui.util');
var Element = require('./element');
var Arrow = require('./arrow');
var AWS_Users = require('./aws/AWS_Users');
var AWS_EC2_Instance = require('./aws/AWS_EC2_Instance');

function resizeGuiContainer(renderer) {

  var dim = GuiUtil.getWindowDimension();

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

var PixiEditor = {
  controller: function(options) {

    var winDimension = GuiUtil.getWindowDimension();

    var renderer = PIXI.autoDetectRenderer(winDimension.x, winDimension.y, {backgroundColor : 0xFFFFFF});

    var stage = new PIXI.Container();
    var elements = new PIXI.Container();
    var arrows = new PIXI.Container();
    var arrowGraphics = new PIXI.Graphics();
    arrowGraphics.lineStyle(2, 0x00E5E5, 1);

    var meter = new FPSMeter();

    var fps = 60;
    var now;
    var then = Date.now();
    var interval = 1000/fps;
    var delta;

    function animate() {
      requestAnimationFrame(animate);

      now = Date.now();
      delta = now - then;

      if (delta > interval) {
        then = now - (delta % interval);
        meter.tick();

        renderer.render(stage);
      }
    }

    function onLoaded() {
      console.log('Assets loaded');

      var dim = GuiUtil.getWindowDimension();
      console.log(elements.position);
      var users = new AWS_Users('users', dim.x/2, 100);
      console.log(users.position);
      elements.addChild(users);

      var instance1 = new AWS_EC2_Instance('instance1', dim.x/2, 400);
      console.log(instance1.position);
      elements.addChild(instance1);

      //console.log(elementsContainer.getLocalBounds());

      users.addArrowTo(instance1);

      console.log('Children:');
      console.log(elements.children);
      //var arrow = Arrow.drawBetween(users, instance1);

      stage.addChild(elements);
      console.log(stage.children);

      arrowGraphics.clear();
      elements.children.forEach(function(element) {
        console.log('Element pos:');
        console.log(element.position);
        arrowGraphics.moveTo(element.position.x, element.position.y);
        element.arrows.forEach(function(target) {
          console.log('Target pos:');
          console.log(target.position);
          arrowGraphics.lineTo(target.position.x, target.position.y);
        })
      });
      console.log(arrowGraphics);
      arrows.addChild(arrowGraphics);
      stage.addChild(arrows);
    }

    PIXI.loader
      .add('../resources/sprites/sprites.json')
      .load(onLoaded);

    stage.interactive = true;
    var grid = stage.addChild(GuiUtil.drawGrid(winDimension.x, winDimension.y));

    console.log('Adding listener...');
    $(window).resize(function() {
      resizeGuiContainer(renderer);
      winDimension = GuiUtil.getWindowDimension();
      //console.log(newDim);
      console.log(stage);
      stage.removeChild(grid);
      grid = stage.addChild(GuiUtil.drawGrid(winDimension.x, winDimension.y));
    });

    return {
      template: options.template,

      drawCanvasEditor: function (element, isInitialized, context) {

        if (isInitialized) {
          animate();
          return;
        }

        //var elementSize = 100;
        //resizeGuiContainer();

        element.appendChild(renderer.view);

        renderer.render(stage);

        animate();

      }
    }
  },
  view: function(controller) {
    return m('#guiContainer', { config: controller.drawCanvasEditor})
  }
};

module.exports = PixiEditor;
