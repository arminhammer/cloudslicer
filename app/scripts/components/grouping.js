/**
 * Created by arminhammer on 9/21/15.
 */

var Grouping = function(name,x,y) {
  PIXI.Graphics.call(this);
  var self = this;
  self.name = name;

  //self.graphics = new PIXI.Graphics();
  //self.graphics.lineStyle(3, 0x000000, 1);
  //self.draw.moveTo(x,y);
  //self.graphics.drawRoundedRect(x,y,200,200,10);
  //self.add(self.graphics);

};
Grouping.prototype = Object.create(PIXI.Graphics.prototype);

module.exports = Grouping;
