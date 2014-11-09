/**
 * Created by armin on 11/9/14.
 */
var Playlist = function() {

  var tracks = [];
  var manager = null;

  console.log('Playlist length: %d', tracks.length);

  var manage = function() {

    console.log('Managing');
    console.log('Playlist length: %d', tracks.length);
    if(tracks.length > 0) {

      if(tracks[0].tLength > 1000) {
        tracks[0].tLength -= 1000;
        console.log('Track length: %d', tracks[0].tLength);
      } else if(tracks[0].tLength > 0) {
        tracks[0].tLength = 0;
        console.log('Track length: %d', tracks[0].tLength);
      }
      else if(tracks[0].tLength === 0){
        console.log('Track finished.');
        tracks.shift();
      }

    }

  }

  this.addTrack = function(track) {
    tracks.push(track);
    console.log('track %s added to the playlist', track);
  }

  this.start = function() {

    manager = setInterval(manage, 1000);

  }

  this.stop = function() {

    clearInterval(manager);
    manager = null;

  }

}

module.exports = Playlist;
