/**
 * Created by arming on 9/15/15.
 */

var Component = function() {
  PIXI.Sprite.call(this);
  var self = this;

  self.anchor.set(0.5);
  self.interactive = true;
  self.buttonMode = true;

};
Component.prototype = Object.create(PIXI.Sprite.prototype);

module.exports = Component;
