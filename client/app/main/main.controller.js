'use strict';

angular.module('beatschApp')
  .controller('MainCtrl', function ($scope, $http, socket, SongList) {

    $scope.testSong = 'TdrL3QxjyVw';

    $scope.songList = new SongList();

    $http.get('/api/songs').success(function(songList) {
      $scope.songList = songList;
      socket.syncUpdates('song', $scope.songList);
    });

    $scope.addSong = function() {
      if($scope.newSong === '') {
        return;
      }
      $http.post('/api/songs', { title: $scope.newSong });
      $scope.newSong = '';
    };

    $scope.deleteSong = function(song) {
      $http.delete('/api/songs/' + song._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('song');
    });
  })
  .factory('SongList', function($http, socket) {

    var SongList = function() {
      this.list = [];
    };

    SongList.prototype.loadMore = function() {

      $http.get('/api/songs')
        .success(function(songList) {
          console.log('list length: %s', songList.length);
          for(var i=0; i < songList.length; i++) {
            this.list.push(songList[i]);
          }
          socket.syncUpdates('song', this.list);
          //this.list = songList;
         }.bind(this));

      /*
       var last = this.list[this.list.length - 1];
       for(var i = 1; i <= 8; i++) {
       this.list.push({title: last + i});
       }
       */
    };

    return SongList;

  });
