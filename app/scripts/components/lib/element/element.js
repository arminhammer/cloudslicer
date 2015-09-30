/**
 * Created by arming on 9/15/15.
 */

var Component = require('../component/component');
var ElementDragDrop = require('./element.drag.drop');

var DEFAULT_SCALE = 0.7;

var Element = function() {
  Component.call(this);
  var self = this;

  self.scale.set(DEFAULT_SCALE);
  self
    // events for drag start
    .on('mousedown', ElementDragDrop.onDragStart)
    .on('touchstart', ElementDragDrop.onDragStart)
    // events for drag end
    .on('mouseup', ElementDragDrop.onDragEnd)
    .on('mouseupoutside', ElementDragDrop.onDragEnd)
    .on('touchend', ElementDragDrop.onDragEnd)
    .on('touchendoutside', ElementDragDrop.onDragEnd)
    // events for drag move
    .on('mousemove', ElementDragDrop.onDragMove)
    .on('touchmove', ElementDragDrop.onDragMove)
    // events for mouse over
    .on('mouseover', ElementDragDrop.onMouseOver)
    .on('mouseout', ElementDragDrop.onMouseOut);

  self.arrows = [];

  self.addArrowTo = function(b) {
    self.arrows.push(b);
  };

  self.removeArrowTo = function(index) {
    self.arrows.remove(index);
  };

};
Element.prototype = Object.create(Component.prototype);

module.exports = Element;
