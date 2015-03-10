'use strict';

angular.module('beatschApp')
  .controller('MainCtrl', ['$scope', '$http', 'socket', '$log', 'Auth', function ($scope, $http, socket, $log, Auth) {

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

    $scope.addSong = function() {

      if($scope.newSong === '') {
        return;
      }

      console.log('Adding new song');
      console.log($scope.newSong);

      $http.post('/api/video/add', { newSong: $scope.newSong, user: Auth.getCurrentUser() });
      $scope.newSong = '';

    };

    $scope.searchYoutube = function(searchValue) {
      return $http.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: searchValue,
          order: 'viewCount',
          //videoDefinition: 'high',
          videoEmbeddable: 'true',
          type: 'video',
          //videoCaption: 'closedCaption',
          key: 'AIzaSyCNYKLmc5xIjQ7-M1gGZMn3OK8vLJ-qFzM'
        }
      }).then(function(response){
        return response.data.items.map(function(video){
          return video;
        });
      });
    };

  }]);
