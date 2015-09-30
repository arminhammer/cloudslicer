/**
 * Created by arming on 9/15/15.
 */

var Component = require('../component/component');
var GroupDragDrop = require('./group.drag.drop');

var DEFAULT_SCALE = 0.7;

var Group = function() {
  Component.call(this);
  var self = this;

  self.scale.set(DEFAULT_SCALE);
  self.anchor.set(0.5);
  self.interactive = true;
  self.buttonMode = true;
  self
    // events for drag start
    .on('mousedown', GroupDragDrop.onDragStart)
    .on('touchstart', GroupDragDrop.onDragStart)
    // events for drag end
    .on('mouseup', GroupDragDrop.onDragEnd)
    .on('mouseupoutside', GroupDragDrop.onDragEnd)
    .on('touchend', GroupDragDrop.onDragEnd)
    .on('touchendoutside', GroupDragDrop.onDragEnd)
    // events for drag move
    .on('mousemove', GroupDragDrop.onDragMove)
    .on('touchmove', GroupDragDrop.onDragMove)
    // events for mouse over
    .on('mouseover', GroupDragDrop.onMouseOver)
    .on('mouseout', GroupDragDrop.onMouseOut);

  self.arrows = [];

  self.addArrowTo = function(b) {
    self.arrows.push(b);
  };

  self.removeArrowTo = function(index) {
    self.arrows.remove(index);
  };

};
Group.prototype = Object.create(Component.prototype);

module.exports = Group;
