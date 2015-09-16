/**
 * Created by arminhammer on 9/14/15.
 */

var DragDrop = {

  onDragStart: function(event) {
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
  },

  onDragEnd: function() {
    this.alpha = 1;

    this.dragging = false;

    // set the interaction data to null
    this.data = null;
  },

  onDragMove: function() {
    if (this.dragging)
    {
      var global = this.toGlobal(this.parent);
      var local = this.toLocal(this.parent);
      //console.log('x: ' + this.x + ' y: ' + this.y);
      //console.log('this: ' + this.x+":"+this.y + ", global: " + global.x + ":" + global.y + ", local: " + local.x + ":" + local.y);
      //console.log('width: ' + this.width + ' height: ' + this.height);
      var newPosition = this.data.getLocalPosition(this.parent);
      //console.log('NEW: ' + newPosition.x + ':' + newPosition.y);
      var local = this.toLocal(this.data);
      //console.log('LOCAL: ' + local.x + ':' + local.y);
      this.position.x = newPosition.x;
      this.position.y = newPosition.y;
      //this.moveTo(newPosition.x, newPosition.y);
    }
  }

};

module.exports = DragDrop;

/*
function onMouseOver() {
  var self = this;
  var iconSize = 10;

  console.log('Mouse over');
  var global = self.toGlobal(self.parent);
  console.log('GLOBAL: ' + global.x + ':' + global.y);

  var scaleLocations = [
    {x: -5, y: -5, size: iconSize},
    {x: elementSize-5, y: -5, size: iconSize},
    {x: -5, y: elementSize-5, size: iconSize},
    {x: elementSize-5, y: elementSize-5, size: iconSize}
  ];

  //moveIcon.drawRect(elementSize-5, -5, 10, 10);
  //moveIcon.drawRect(-5, elementSize-5, 10, 10);
  //moveIcon.drawRect(elementSize-5, elementSize-5, 10, 10);

  self.scaleIcons = [];

  scaleLocations.forEach(function(loc) {
    var icon = new PIXI.Graphics();
    icon.interactive = true;
    icon.buttonMode = true;
    icon.lineStyle(1, 0x0000FF, 1);
    icon.beginFill(0x000000, 1);
    icon.drawRect(loc.x, loc.y, loc.size, loc.size);
    icon.endFill();

    icon
      // events for drag start
      .on('mousedown', onScaleIconDragStart)
      .on('touchstart', onScaleIconDragStart);
    // events for drag end
    //.on('mouseup', onDragEnd)
    //.on('mouseupoutside', onDragEnd)
    //.on('touchend', onDragEnd)
    //.on('touchendoutside', onDragEnd)
    // events for drag move
    //.on('mousemove', onDragMove)
    //.on('touchmove', onDragMove)

    self.scaleIcons.push(icon);

  });

  //moveIcon.endFill();

  //stage.removeChild(self);
  //stage.addChild(icon);
  self.scaleIcons.forEach(function(s) {
    self.addChild(s);
  });
  //this.addChild(this.scaleIcons[0])
  //stage.addChild(this);

}

function onMouseOut() {
  var self = this;
  console.log('Mouse out');
  this.scaleIcons.forEach(function(s) {
    self.removeChild(s);
  });
  console.log('Size: ');
  console.log(this.getBounds());

}

function onScaleIconDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
  console.log('Resizing!');
}
*/
