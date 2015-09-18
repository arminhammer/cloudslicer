/**
 * Created by arming on 9/17/15.
 */

var Arrow = {

  drawBetween: function(a, b) {

    var arrow = new PIXI.Graphics();

    console.log(a.getBounds());
    console.log(b.getBounds());

    /*
    arrow.lineStyle(1, 0xE5E5E5, 1);
    while (count < width) {
      grid.moveTo(count, 0);
      grid.lineTo(count, height);
      count = count + interval;
    }
    count = interval;
    while(count < height) {
      grid.moveTo(0, count);
      grid.lineTo(width, count);
      count = count + interval;
    }
    return arrow;
    */
  }

};

module.exports = Arrow;
