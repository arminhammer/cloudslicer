/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var GuiUtil = require('./gui.util');
var Element = require('./lib/element/element');
//var Arrow = require('./arrow');
var EditorManager = require('./EditorManager');

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

    var template = options.template();
    console.log(template);

    var MANAGER = new EditorManager(template);
    MANAGER.init();

    console.log('Adding listener...');
    $(window).resize(function() {
      resizeGuiContainer(MANAGER.renderer);
    });

    return {
      template: options.template,

      drawCanvasEditor: function (element, isInitialized, context) {

        if (isInitialized) {
          MANAGER.animate();
          return;
        }

        element.appendChild(MANAGER.renderer.view);

        MANAGER.animate();

      }
    }
  },
  view: function(controller) {
    return m('#guiContainer', { config: controller.drawCanvasEditor})
  }
};

module.exports = PixiEditor;
