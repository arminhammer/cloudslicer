/**
 * Created by arminhammer on 9/21/15.
 */

var Element = require('../element');

var AWS_EC2_SecurityGroup = function(name,x,y) {
  Element.call(this);

  var self = this;
  self.name = name;

  var graphic = new PIXI.Graphics();
  graphic.lineStyle(3, 0x000000, 1);
  graphic.beginFill(0xFFFFFF, 1);
  graphic.drawRoundedRect(0,0,200,200,10);
  graphic.endFill();

  self.texture = graphic.generateTexture();
  self.position.x = x;
  self.position.y = y;

};
AWS_EC2_SecurityGroup.prototype = Object.create(Element.prototype);

module.exports = AWS_EC2_SecurityGroup;
