'use strict';

angular.module('beatschApp')
  .controller('MainCtrl', ['$scope', '$http', 'socket', '$log', 'Auth', '$sce', function ($scope, $http, socket, $log, Auth, $sce) {

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

    $scope.currentTime = 0;
    $scope.totalTime = 0;
    $scope.state = null;
    $scope.volume = 1;
    $scope.isCompleted = false;
    $scope.API = null;

    $scope.onPlayerReady = function (API) {
      $scope.API = API;
    };

    $scope.onCompleteVideo = function () {
      $scope.isCompleted = true;
    };

    $scope.onUpdateState = function (state) {
      $scope.state = state;
    };

    $scope.onUpdateTime = function (currentTime, totalTime) {
      $scope.currentTime = currentTime;
      $scope.totalTime = totalTime;
    };

    $scope.onUpdateVolume = function (newVol) {
      $scope.volume = newVol;
    };

    $scope.videos1 = [
      {
        sources: [
          {src: "https://www.youtube.com/watch?v=gi-wl43o3gc"}
        ]
        // Tracks are inside .mpd file and added by Dash.js
      },
      {
        sources: [
          {src: $sce.trustAsResourceUrl("https://dl.dropboxusercontent.com/u/7359898/video/videogular.mp4"), type: "video/mp4"},
          {src: $sce.trustAsResourceUrl("https://dl.dropboxusercontent.com/u/7359898/video/videogular.webm"), type: "video/webm"},
          {src: $sce.trustAsResourceUrl("https://dl.dropboxusercontent.com/u/7359898/video/videogular.ogg"), type: "video/ogg"}
        ],
        tracks: [
          {
            src: "assets/subs/pale-blue-dot.vtt",
            kind: "subtitles",
            srclang: "en",
            label: "English",
            default: ""
          }
        ]
      }
    ];

    /*
    $scope.config = {
      autoHide: false,
      autoHideTime: 3000,
      autoPlay: false,
      sources: $scope.videos1[0].sources,
      tracks: $scope.videos1[0].tracks,
      loop: false,
      preload: "auto",
      transclude: true,
      controls: undefined,
      theme: {
        url: "styles/themes/default/videogular.css"
      },
      plugins: {
        poster: {
          url: "assets/images/videogular.png"
        },
        ads: {
          companion: "companionAd",
          companionSize: [728, 90],
          network: "6062",
          unitPath: "iab_vast_samples",
          adTagUrl: "http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=%2F3510761%2FadRulesSampleTags&ciu_szs=160x600%2C300x250%2C728x90&cust_params=adrule%3Dpremidpostpodandbumpers&impl=s&gdfp_req=1&env=vp&ad_rule=1&vid=47570401&cmsid=481&output=xml_vast2&unviewed_position_start=1&url=[referrer_url]&correlator=[timestamp]",
          skipButton: "<div class='skipButton'>skip ad</div>"
        }
      }
    };
    */

    $scope.config = {
      preload: "none",
      sources: [
        { src: "https://www.youtube.com/watch?v=nVjsGKrE6E8" }
      ]
    };

    $scope.changeSource = function () {
      $scope.config.sources = $scope.videos1[1].sources;
      $scope.config.tracks = undefined;
      $scope.config.loop = false;
      $scope.config.preload = true;
    };

  }]);
