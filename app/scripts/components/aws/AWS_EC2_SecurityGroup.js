/**
 * Created by arminhammer on 9/21/15.
 */

var Collection = require('../collection');

var AWS_EC2_SecurityGroup = function(name,x,y) {
  Collection.call(this);
  var self = this;
  self.name = name;

  self.draw = new PIXI.Graphics();
  self.draw.lineStyle(3, 0x000000, 1);
  //self.draw.moveTo(x,y);
  self.draw.drawRoundedRect(x,y,200,200,10);
  self.add(self.draw);

};
AWS_EC2_SecurityGroup.prototype = Object.create(Collection.prototype);

module.exports = AWS_EC2_SecurityGroup;