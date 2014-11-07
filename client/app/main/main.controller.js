'use strict';

angular.module('beatschApp')
  .controller('MainCtrl', function ($scope, $http, socket) {

    $scope.testVideo = 'TdrL3QxjyVw';

    $scope.videoList = [];

    $http.get('/api/videos').success(function(videoList) {
      $scope.videoList = videoList;
      socket.syncUpdates('video', $scope.videoList);
    });

    $scope.addVideo = function() {
      if($scope.newVideo === '') {
        return;
      }
      $http.post('/api/videos', { name: $scope.newVideo });
      $scope.newVideo = '';
    };

    $scope.deleteVideo = function(video) {
      $http.delete('/api/videos/' + video._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('video');
    });
  });
