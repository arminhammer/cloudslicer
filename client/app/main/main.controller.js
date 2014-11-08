'use strict';

angular.module('beatschApp')
  .controller('MainCtrl', function ($scope, $http, socket) {

    $scope.testSong = 'TdrL3QxjyVw';

    $scope.songList = [];

    $http.get('/api/songs').success(function(songList) {
      $scope.songList = songList;
      socket.syncUpdates('song', $scope.songList);
    });

    $scope.addSong = function() {
      if($scope.newSong === '') {
        return;
      }
      $http.post('/api/songs', { name: $scope.newSong });
      $scope.newSong = '';
    };

    $scope.deleteSong = function(song) {
      $http.delete('/api/songs/' + song._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('song');
    });
  });
