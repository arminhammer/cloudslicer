/**
 * Created by arminhammer on 8/25/15.
 */

var width = window.innerWidth;
var height = window.innerHeight;
var renderer = PIXI.autoDetectRenderer(width, height,{backgroundColor : 0xffffff});
document.body.appendChild(renderer.view);

var elementSize = 100;

// create the root of the scene graph
var stage = new PIXI.Container();

stage.interactive = true;

function drawGrid() {
  var grid = new PIXI.Graphics();
  var interval = 25;
  var count = interval;
  grid.lineStyle(1, 0xE5E5E5, 1);
  while (count < width) {
    grid.moveTo(count, 0);
    grid.lineTo(count, height);
    count = count + interval;
  }
  var count = interval;
  while(count < height) {
    grid.moveTo(0, count);
    grid.lineTo(width, count);
    count = count + interval;
  }
  return grid;
}

var grid = drawGrid();
stage.addChild(grid);

var Element = function() {
  PIXI.Graphics.call(this);
};
Element.prototype = Object.create(PIXI.Graphics.prototype);
Element.prototype.constructor = Element;

function createElement(name, x, y) {
  var e = new Element();
  //var e = new PIXI.Graphics());
  e.name = name;
  e.interactive = true;
  e.buttonMode = true;
  // center the bunny's anchor point
  //e.anchor.set(0.5);

  // make it a bit bigger, so it's easier to grab
  //e.scale.set(3);

  // setup events
  e
    // events for drag start
    .on('mousedown', onDragStart)
    .on('touchstart', onDragStart)
    // events for drag end
    .on('mouseup', onDragEnd)
    .on('mouseupoutside', onDragEnd)
    .on('touchend', onDragEnd)
    .on('touchendoutside', onDragEnd)
    // events for drag move
    .on('mousemove', onDragMove)
    .on('touchmove', onDragMove)
    // events for mouse over
    .on('mouseover', onMouseOver)
    .on('mouseout', onMouseOut);

  //e.moveTo(x,y);
  e.position.x = x;
  e.position.y = y;
  e.lineStyle(1, 0x0000FF, 1);
  e.beginFill(0xFF700B, 1);
  e.drawRect(0, 0, elementSize, elementSize);
  e.endFill();
  //e.x = x;
  //e.y = y;

  //console.log('Square is at ' + square.position.x + ','+ square.position.y);
  console.log('El is at ' + e.position.x + ','+ e.position.y);

  return e;
}

function onDragStart(event)
{
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
}

function onDragEnd()
{
  this.alpha = 1;

  this.dragging = false;

  // set the interaction data to null
  this.data = null;
}

function onDragMove()
{
  if (this.dragging)
  {
    var global = this.toGlobal(this.parent);
    var local = this.toLocal(this.parent);
    console.log('x: ' + this.x + ' y: ' + this.y);
    console.log('this: ' + this.x+":"+this.y + ", global: " + global.x + ":" + global.y + ", local: " + local.x + ":" + local.y);
    //console.log('width: ' + this.width + ' height: ' + this.height);
    var newPosition = this.data.getLocalPosition(this.parent);
    console.log('NEW: ' + newPosition.x + ':' + newPosition.y);
    var local = this.toLocal(this.data);
    console.log('LOCAL: ' + local.x + ':' + local.y);
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;
    //this.moveTo(newPosition.x, newPosition.y);
  }
}

function onMouseOver() {
  var self = this;
  var iconSize = 25;

  console.log('Mouse over');
  var global = self.toGlobal(self.parent);
  console.log('GLOBAL: ' + global.x + ':' + global.y);

  var scaleLocations = [
    {x: -10, y: -10, size: iconSize},
    {x: elementSize-10, y: -10, size: iconSize},
    {x: -10, y: elementSize-10, size: iconSize},
    {x: elementSize-10, y: elementSize-10, size: iconSize}
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

function onScaleIconDragStart(event)
{
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
  console.log('Resizing!');
}

var elements = [];
var el1 = createElement('el1', 100, 100);
var el2 = createElement('el2', 200, 200);
var el3 = createElement('el3', 300, 300);
elements.push(el1);
elements.push(el2);
elements.push(el3);

elements.forEach(function(element) {
  console.log(element.name);
  console.log(element.position);
  console.log(element.height + ':' + element.width);
  stage.addChild(element);
});

/*
graphics.lineStyle(4, 0x000000, 1);
graphics.moveTo(250,0);
graphics.lineTo(250,height);

graphics.lineStyle(1, 0x000000, 1);
graphics.moveTo(270,0);
graphics.lineTo(270,height);

var graphics = new PIXI.Graphics();


// set a fill and line style
graphics.beginFill(0xFF3300);
graphics.lineStyle(4, 0xffd900, 1);

// draw a shape
graphics.moveTo(50,50);
graphics.lineTo(250, 50);
graphics.lineTo(100, 100);
graphics.lineTo(50, 50);
graphics.endFill();

// set a fill and a line style again and draw a rectangle
graphics.lineStyle(2, 0x0000FF, 1);
graphics.beginFill(0xFF700B, 1);
graphics.drawRect(50, 250, 120, 120);

// draw a rounded rectangle
graphics.lineStyle(2, 0xFF00FF, 1);
graphics.beginFill(0xFF00BB, 0.25);
graphics.drawRoundedRect(150, 450, 300, 100, 15);
graphics.endFill();

// draw a circle, set the lineStyle to zero so the circle doesn't have an outline
graphics.lineStyle(0);
graphics.beginFill(0xFFFF0B, 0.5);
graphics.drawCircle(470, 90,60);
graphics.endFill();

stage.addChild(graphics);

 */

// start animating
animate();

function animate() {
  renderer.render(stage);
  requestAnimationFrame(animate);
}

// resize the canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;

  animate();
}
resizeCanvas();
