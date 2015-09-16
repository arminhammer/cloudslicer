/**
 * Created by arming on 9/15/15.
 */

var DragDrop = require('./drag.drop');

var DEFAULT_SCALE = 0.5;

function construct(iconURL, x, y, scale) {
  var element = PIXI.Sprite.fromFrame(iconURL);
  //console.log('EC2Instance');
  //console.log(element);
  element.scale.set(scale);
  element.position.x = x;
  element.position.y = y;
  element.anchor.set(0.5);
  element.interactive = true;
  element.buttonMode = true;
  element
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
    .on('touchmove', DragDrop.onDragMove);
  // events for mouse over
  //.on('mouseover', onMouseOver)
  //.on('mouseout', onMouseOut);
  return element;
}

var Element = {

  AWS_EC2_Element: function(x,y) {
    return construct('Compute_&_Networking_Amazon_EC2--.png', x, y, DEFAULT_SCALE)
  },

  AWS_Users: function(x,y) {
    return construct('Non-Service_Specific_copy_Users.png', x, y, DEFAULT_SCALE)
  }

};

module.exports = Element;