'use strict';

angular.module('beatschApp')
  .controller('MainCtrl', ['$scope',
    '$http',
    'socket',
    '$log',
    'Auth',
    '$sce',
    '$timeout',
    '$filter',
    function ($scope, $http, socket, $log, Auth, $sce, $timeout, $filter) {

    $scope.videos = [];

    $scope.currentTime = 0;
    $scope.totalTime = 0;
    $scope.state = null;
    $scope.volume = 1;
    $scope.isCompleted = false;
    $scope.API = null;

    $scope.currentVideo = { index: 0 };

    $scope.config = {
      autoHide: false,
      autoHideTime: 3000,
      autoPlay: true,
      //sources: $scope.videos[0].sources,
      //tracks: $scope.videos[0].tracks,
      //loop: false,
      preload: "auto",
      //transclude: true,
      controls: undefined,
      theme: {
        url: "styles/themes/default/videogular.css"
      },
      plugins: {
        poster: {
          url: "assets/images/videogular.png"
        }
      }
    };

    function sortVideos(array) {
      console.log('Sorting!');
      console.log('Before:');
      console.log(array);

      var unsorted = true;

      //while(unsorted) {

        //for(var i=0; i< array.length; i++) {

        //}

      //}
      array = $filter('orderBy')(array, '-score');
      console.log('After:');
      console.log(array);

      return array;

    }

    $http.get('/api/video').success(function(videos) {

      console.log('GET videos:');
      $log.debug(videos);
      $scope.videos = sortVideos(videos);
      socket.syncUpdates('video', $scope.videos);

      $scope.config.sources = $scope.videos[0].sources;
      $scope.currentVideo = $scope.videos[0];
      $scope.currentVideo.index = 0;

    });

    $scope.voteFor = function(video) {

      $log.debug('Voting for ' + video._id);
      $http.post('/api/video/vote', { id: video._id });

    };

    $scope.addSong = function() {

      if($scope.newSong === '') {
        return;
      }

      console.log('Adding new song');
      console.log($scope.newSong);

      $http.post('/api/video/add', { newSong: $scope.newSong, user: Auth.getCurrentUser() });
      $scope.newSong = '';

    };

      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('video');
      });

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

    $scope.onPlayerReady = function(API) {
      console.log('Setting API');
      console.log(API);
      $scope.API = API;
    };

    $scope.setVideo = function(index) {
      $scope.API.stop();
      $scope.currentVideo = $scope.videos[index];
      $scope.currentVideo.index = index;
      $scope.videos = sortVideos($scope.videos);
      $scope.config.sources = $scope.videos[index].sources;
      $timeout($scope.API.play.bind($scope.API), 100);
    };

    $scope.onCompleteVideo = function () {
      $scope.isCompleted = true;
      console.log('Completed video');

      console.log('Current old: ' + $scope.currentVideo.index);

      $scope.currentVideo.index++;

      if ($scope.currentVideo.index >= $scope.videos.length) {

        $scope.currentVideo.index = 0;

      }

      console.log('Current new: ' + $scope.currentVideo.index);
      $scope.setVideo($scope.currentVideo.index);

    };

    $scope.onUpdateState = function (state) {
      $scope.state = state;
      console.log('Updated state');
    };

    $scope.onUpdateTime = function (currentTime, totalTime) {
      $scope.currentTime = currentTime;
      $scope.totalTime = totalTime;
      console.log('Updated time')
    };

    $scope.onUpdateVolume = function (newVol) {
      $scope.volume = newVol;
    };

    $scope.changeSource = function () {
      $scope.config.sources = $scope.videos1[1].sources;
      $scope.config.tracks = undefined;
      $scope.config.loop = false;
      $scope.config.preload = true;
    };

  }]);
