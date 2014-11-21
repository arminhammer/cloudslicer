/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Playlist = require('./playlist.model');

var PlaylistManager = require('./playlist.manager');

var playlistManager = new PlaylistManager();
playlistManager.start();

exports.register = function(socket) {

  Playlist.schema.post('save', function (doc) {

    Playlist.findById(doc._id).
      populate('_song')
      .exec(function(err, popDoc) {

        console.log('popDoc');
        console.log(popDoc);
        onSave(socket, popDoc);

      });

  });

  Playlist.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });

  playlistManager.register(socket);

}

exports.unregister = function(socket) {

  playlistManager.unregister(socket);

}


function onSave(socket, doc, cb) {

  socket.emit('playlist:save', doc);

}

function onRemove(socket, doc, cb) {

  socket.emit('playlist:remove', doc);

}
