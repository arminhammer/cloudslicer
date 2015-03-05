'use strict';

angular.module('beatschApp')
  .controller('MainCtrl', ['$scope', '$http', 'socket', '$log', function ($scope, $http, socket, $log) {

    $scope.videos = [];

    $http.get('/api/video').success(function(videos) {

      $log.debug(videos);
      $scope.videos = videos;
      socket.syncUpdates('video', $scope.videos);

    });

    $scope.voteFor = function(video) {

      $log.debug('Voting for ' + video._id);
      $http.post('/api/video/vote', { id: video._id });

    };

    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  }]);
