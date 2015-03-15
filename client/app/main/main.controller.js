'use strict';

angular.module('beatschApp')
  .controller('MainCtrl', ['$scope', '$http', 'socket', '$log', 'Auth', '$sce', '$timeout', function ($scope, $http, socket, $log, Auth, $sce, $timeout) {

    $scope.videos = [];

    $http.get('/api/video').success(function(videos) {

      console.log('GET videos:');
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

    $scope.currentTime = 0;
    $scope.totalTime = 0;
    $scope.state = null;
    $scope.volume = 1;
    $scope.isCompleted = false;
    $scope.API = null;

    $scope.currentVideo = 0;

    $scope.onPlayerReady = function (API) {
      console.log('API');
      console.log(API);
      $scope.API = API;
    };

    $scope.setVideo = function(index) {
      $scope.API.stop();
      $scope.currentVideo = index;
      $scope.config.sources = $scope.videos1[index].sources;
      $timeout($scope.API.play.bind($scope.API), 100);
    };

    $scope.onCompleteVideo = function () {
      $scope.isCompleted = true;
      console.log('Completed video');

      console.log('Current old: ' + $scope.currentVideo);

      $scope.currentVideo++;

      if ($scope.currentVideo >= $scope.videos1.length) {

        $scope.currentVideo = 0;

      }

      console.log('Current new: ' + $scope.currentVideo);
      $scope.setVideo($scope.currentVideo);


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

    $scope.videos1 = [
      {
        sources: [
          {src: "https://www.youtube.com/watch?v=nVjsGKrE6E8"}
        ]
      },
      {
        sources: [
          {src: "https://www.youtube.com/watch?v=rEaPDNgUPLE"}
        ]
      },
      {
        sources: [
          {src: "https://www.youtube.com/watch?v=nay31hvEvrY"}
        ]
      }
    ];

    console.log('Videos:');
    console.log($scope.videos);
    console.log('Videos1:');
    console.log($scope.videos1);


    $scope.config = {
      autoHide: false,
      autoHideTime: 3000,
      autoPlay: true,
      sources: $scope.videos1[0].sources,
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

    $scope.changeSource = function () {
      $scope.config.sources = $scope.videos1[1].sources;
      $scope.config.tracks = undefined;
      $scope.config.loop = false;
      $scope.config.preload = true;
    };

  }]);
