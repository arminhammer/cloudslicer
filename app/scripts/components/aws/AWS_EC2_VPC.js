/**
 * Created by arminhammer on 9/21/15.
 */

var Group = require('../lib/group/group');

var AWS_EC2_VPC = function(name,x,y) {
  Group.call(this);

  var self = this;
  self.name = name;

  var graphic = new PIXI.Graphics();
  graphic.lineStyle(3, 0x00FF00, 1);
  graphic.beginFill(0xFFFFFF, 0.0);
  graphic.drawRoundedRect(0,0,200,200,10);
  graphic.endFill();

  self.texture = graphic.generateTexture();
  self.position.x = x;
  self.position.y = y;

};
AWS_EC2_VPC.prototype = Object.create(Group.prototype);

module.exports = AWS_EC2_VPC;
