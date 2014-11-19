'use strict';

angular.module('beatschApp')
  .controller('MainCtrl', function ($scope, $http, socket) {

    //$scope.currentSong = 'tUmlmDtxcBo';

    /*
     $scope.getNextSong = function() {

     if($scope.playList.length === 0) {
     return '';
     }
     else {
     return $scope.playList[0].url.youtubeid;
     }

     };
     */

    //$scope.songList = new SongList();

    /*
     $scope.playListVideoIds = function() {

     var playList = $scope.playList;
     var count = playList.length;
     var returnList = [];

     for(var i = 0; i < count; i++) {

     returnList.push(playList[i].url.videoId);

     }

     return returnList;

     };
     */

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

      socket.syncUpdates('playlog', $scope.currentSong);
      socket.syncUpdates('playlog', $scope.playLog);

    });

    $scope.voteFor = function(song) {
      $http.get('/api/songs/' + song._id + '/vote');
      socket.syncUpdates('song', $scope.playList);
      socket.syncUpdates('song', $scope.songList.list);
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

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('song');
    });

    $scope.$on('youtube.player.ready', function ($event, player) {

      console.log('youtube.player.ready');

      console.log('Playlist before');
      console.log(player.getPlaylist());

      /*
       player.cuePlaylist({

       listType: 'playlist',
       list: $scope.playListVideoIds(),
       index: 0,
       startSeconds: 0,
       suggestedQuality: 'default'

       });

       console.log('Playlist after');
       console.log(player.getPlaylist());
       */

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
      var nextVid = $scope.playList[1].url.youtubeid;
      console.log('nextVid: %s', nextVid);
      player.loadVideoById(nextVid);
      player.playVideo();

    });

  });
/*
 .factory('SongList', function($http) {

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
 //socket.syncUpdates('song', this.list);
 //this.list = songList;
 }.bind(this));

 /*
 var last = this.list[this.list.length - 1];
 for(var i = 1; i <= 8; i++) {
 this.list.push({title: last + i});
 }

 };

 return SongList;

 });
 */
