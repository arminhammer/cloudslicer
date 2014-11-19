'use strict';

angular.module('beatschApp')
  .controller('MainCtrl', function ($scope, $http, socket) {

    $scope.currentSong = null;

    $scope.catalog = [];

    $scope.playLog = [];

    $scope.playList = [];

    $http.get('/api/playlist').success(function(playlist) {

      $scope.playList = playlist;
      socket.syncUpdates('playlist', $scope.playList);

    });

    $http.get('/api/songs').success(function(songs) {
      $scope.catalog = songs;
      socket.syncUpdates('song', $scope.catalog);
    });

    $http.get('/api/playlog').success(function(playLog) {

      $scope.playLog = playLog;

      $scope.currentSong = playLog[playLog.length-1];

      //socket.syncUpdates('playlog', $scope.currentSong);
      socket.syncUpdates('playlog', $scope.playLog);

    });

    $scope.voteFor = function(song) {
      $http.get('/api/songs/' + song._id + '/vote');
      //socket.syncUpdates('song', $scope.playList);
      //socket.syncUpdates('song', $scope.songList.list);
    };

    $scope.addSong = function() {
      if($scope.newSong === '') {
        return;
      }
      $http.post('/api/songs', { title: $scope.newSong, votes: {current: 1, total: 1 }, inPlaylist: false });
      $scope.newSong = '';
    };

    $scope.deleteSong = function(song) {
      $http.delete('/api/songs/' + song._id);
    };

    $scope.searchYoutube = function(searchValue) {
      return $http.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: searchValue,
          order: 'rating',
          videoDefinition: 'high',
          videoEmbeddable: 'true',
          type: 'video',
          videoCaption: 'closedCaption',
          key: 'AIzaSyCNYKLmc5xIjQ7-M1gGZMn3OK8vLJ-qFzM'
        }
      }).then(function(response){
        return response.data.items.map(function(video){
          return video.snippet.title;
        });
      });
    };

    function getNextSongInPlaylist() {

      var currentDate = $scope.currentSong.date;

      var count = 0;

      while(count < $scope.playLog.length) {

        if($scope.playLog[count].date > currentDate) {

          console.log('Found %s', $scope.playLog[count]._song.title);
          return $scope.playLog[count];

        }

        count++;

      }

      console.log('Could not find a more recent song, replaying current song %s', $scope.currentSong.title);
      return $scope.currentSong;

    }

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('song');
    });

    $scope.$on('youtube.player.ready', function ($event, player) {

      console.log('youtube.player.ready');

    });

    $scope.$on('youtube.player.playing', function () {

      console.log('youtube.player.playing');

    });

    $scope.$on('youtube.player.paused', function () {

      console.log('youtube.player.paused');

    });

    $scope.$on('youtube.player.buffering', function () {

      console.log('youtube.player.buffering');

    });

    $scope.$on('youtube.player.queued', function () {

      console.log('youtube.player.queued');

    });

    $scope.$on('youtube.player.ended', function ($event, player) {

      console.log('youtube.player.ended');
      var nextVid = getNextSongInPlaylist();
      console.log('nextVid: %s', nextVid);
      player.loadVideoById(nextVid._song.url.youtubeid);
      player.playVideo();

    });

  });
