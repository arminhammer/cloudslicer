/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Playlist = require('./playlist')();

exports.register = function(socket) {

  Playlist.switchTracks(function() {

    socket.emit('playlist:switchTrack');

  });

};
