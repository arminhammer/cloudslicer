'use strict';

angular.module('beatschApp')
  .controller('MainCtrl', function ($scope, $http, socket) {

    $scope.currentSong = null;

    //$rootScope.currentSong = "Test Current Song"

    $scope.catalog = [];

    $scope.playLog = [];

    $scope.playList = [];

    $scope.timer = 0;

    socket.socket.on('timer', function(timer) {
      $scope.timer = timer;
    });

    $http.get('/api/playlist').success(function(playlist) {

      $scope.playList = playlist;
      socket.syncUpdates('playlist', $scope.playList);

    });

    $http.get('/api/songs').success(function(songs) {
      $scope.catalog = songs;
      socket.syncUpdates('song', $scope.catalog);
    });

    $http.get('/api/playlog/10').success(function(playLog) {

      $scope.playLog = playLog;

      $scope.currentSong = playLog[playLog.length-1];

      //socket.syncUpdates('playlog', $scope.currentSong);
      socket.syncUpdates('playlog', $scope.playLog);


       jQuery('#my-thumbs-list').mThumbnailScroller({
        axis:'y'
      });

      /*
      jQuery(function(){
        //
        $("#bgndVideo").attr('data-property', "{videoURL: '" + $scope.currentSong._song.videoId + "',containment:'body', showControls:true, autoPlay:true, loop:false, vol:100, mute:false, startAt:0, opacity:1, addRaster:false, quality:'default'}");
        $("#bgndVideo").YTPlayer({
          onReady: function (player) {
            console.log(player.id + " player is ready");
          }
        });

      });
      */

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

      console.log('Adding new song');
      console.log($scope.newSong);

      $http.post('/api/songs/add', $scope.newSong);
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

    function getNextSongInPlaylist() {

      var currentDate = $scope.currentSong.date;

      var count = 0;

      while(count < $scope.playLog.length) {

        if($scope.playLog[count].date > currentDate) {

          console.log('Found %s', $scope.playLog[count]._song.title);
          $scope.currentSong = $scope.playLog[count];
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

    function switchBackground(imgUrl) {

      jQuery('body').css('background-image', 'url(' + imgUrl + ')')
        .fadeIn('slow');

    }

    $scope.$on('youtube.player.ready', function ($event, player) {

      console.log('youtube.player.ready');

      player.playVideo();

      console.log('url: %s', $scope.currentSong._song.thumbnailUrlHigh);
      switchBackground($scope.currentSong._song.thumbnailUrlHigh);

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
      player.loadVideoById(nextVid._song.videoId);
      player.playVideo();
      switchBackground($scope.currentSong._song.thumbnailUrlHigh);

    });

    $scope.chats = [];

    $http.get('/api/chats').success(function(chats) {
      $scope.chats = chats;
      socket.syncUpdates('chat', $scope.chats);
    });

    $scope.addChat = function() {
      if($scope.newChat === '') {
        return;
      }
      $http.post('/api/chats', { date: Date.now(), body: $scope.newChat });
      $scope.newChat = '';
    };

    $scope.playerVars = {
      controls: 1,
      autoplay: 1
    };
    /*
    $scope.vidObj = {
      videoURL: 'http://youtu.be/VuaJAgx0x_4',
      containment: 'body',
      autoPlay:true,
      mute:false,
      startAt: 0,
      opacity: 1,
      loop:false,
      ratio: 16/9,
      addRaster:true,
      quality: 'default'
    };
    */

  })
  .directive('beatschPlayer', [function() {

    return {
      //template: '<a id="bgndVideo" class="player" data-property="{{ vidObj }}">My video</a>'
    };

  }]);
