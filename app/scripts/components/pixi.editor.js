/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var DragDrop = require('./drag.drop');
var GuiUtil = require('./gui.util');

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

    stage.interactive = true;
    var grid = stage.addChild(GuiUtil.drawGrid(winDimension.x, winDimension.y));

    console.log('Adding listener...');
    $(window).resize(function() {
      resizeGuiContainer(renderer);
      winDimension = getWindowDimension();
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
        animate();

      }
    }
  },
  view: function(controller) {
    return m('#guiContainer', { config: controller.drawCanvasEditor})
  }
};

module.exports = PixiEditor;
