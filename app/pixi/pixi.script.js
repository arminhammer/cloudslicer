/**
 * Created by arminhammer on 8/25/15.
 */

var width = window.innerWidth;
var height = window.innerHeight;
var renderer = PIXI.autoDetectRenderer(width, height,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

// start animating
animate();

function animate() {

  requestAnimationFrame(animate);

  // create the root of the scene graph
  var stage = new PIXI.Container();

  var container = new PIXI.Container();

  stage.addChild(container);

  for (var j = 0; j < 5; j++) {

    for (var i = 0; i < 5; i++) {
      var bunny = PIXI.Sprite.fromImage('_assets/basics/bunny.png');
      bunny.x = 40 * i;
      bunny.y = 40 * j;
      container.addChild(bunny);
    };
  };

  container.x = 100;
  container.y = 60;

  // render the root container
  renderer.render(stage);
}

// resize the canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  animate();
}
resizeCanvas();
