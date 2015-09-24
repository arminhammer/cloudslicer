/**
 * Created by arminhammer on 9/19/15.
 */

var Element = require('../element');
var DragDrop = require('../drag.drop');

var AWS_EC2_EIP = function(name,x,y) {
  Element.call(this);
  var self = this;
  self.name = name;
  self.scale.set(0.3);
  self.texture = PIXI.Texture.fromFrame('Compute_&_Networking_Amazon_EC2_Elastic_IP.png');
  self.position.x = x;
  self.position.y = y;
};
AWS_EC2_EIP.prototype = Object.create(Element.prototype);

module.exports = AWS_EC2_EIP;
