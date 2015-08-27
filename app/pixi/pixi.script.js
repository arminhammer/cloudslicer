/**
 * Created by arminhammer on 8/25/15.
 */

var width = window.innerWidth;
var height = window.innerHeight;
var renderer = PIXI.autoDetectRenderer(width, height,{backgroundColor : 0xffffff});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

stage.interactive = true;

var graphics = new PIXI.Graphics();

function drawGrid() {
  var interval = 25;
  var count = interval;
  graphics.lineStyle(1, 0xE5E5E5, 1);
  while (count < width) {
    graphics.moveTo(count, 0);
    graphics.lineTo(count, height);
    count = count + interval;
  }
  var count = interval;
  while(count < height) {
    graphics.moveTo(0, count);
    graphics.lineTo(width, count);
    count = count + interval;
  }
}

drawGrid();
/*
graphics.lineStyle(4, 0x000000, 1);
graphics.moveTo(250,0);
graphics.lineTo(250,height);

graphics.lineStyle(1, 0x000000, 1);
graphics.moveTo(270,0);
graphics.lineTo(270,height);
*/

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
