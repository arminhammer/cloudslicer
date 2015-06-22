// todo View Model

var Video = require('../models/Video');

// the view-model tracks a running list of videos, and allows for videos to be added to the list.

var videoViewModel = (function() {
  var vm = {};

  vm.list = [];

  vm.sortPlayList = function() {
    vm.list.sort(function(a, b) {
      return b.score()- a.score();
    });
  };

  vm.initVideoJsPlayer = function() {

    videojs('vid1', { "techOrder": ["youtube"], "src": "http://www.youtube.com/watch?v=QcIy9NiNbmo" }).ready(function() {
      this.one('ended', function() {
        this.src('http://www.youtube.com/watch?v=g_uoH6hJilc');
        this.play();
      });
    });

  };

  vm.init = function() {
    //a running list of videos
    //vm.list = [];
    vm.description = m.prop("");

    var video1 = new Video({ title: 'Video 1', description: 'This is Video 1', score: 125 });
    var video2 = new Video({ title: 'Video 2', description: 'This is Video 2', score: 475 });
    var video3 = new Video({ title: 'Video 3', description: 'This is Video 3', score: 300 });

    console.log('Adding videos');
    console.log(vm.list);
    vm.list.push(video1);
    vm.list.push(video2);
    vm.list.push(video3);
    console.log(vm.list);
    console.log(vm.list[0]);

    vm.sortPlayList();

    //console.log(vm.list);

    //adds a video to the list, and clears the description field for user convenience
    vm.add = function() {
      if (vm.description()) {
        vm.list.push(new Video({description: vm.description()}));
        vm.description("");
      }
    };
  };

  return vm

}());

module.exports = videoViewModel;
