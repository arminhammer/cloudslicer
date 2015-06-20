// todo View Model

var Video = require('../models/Video');

// the view-model tracks a running list of videos, and allows for videos to be added to the list.

var videoViewModel = (function() {
    var vm = {};
    vm.init = function() {
        //a running list of videos
        vm.list = [];
        vm.description = m.prop("");

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
