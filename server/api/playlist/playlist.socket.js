/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Playlist = require('./playlist.model');

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
}

function onSave(socket, doc, cb) {
  socket.emit('playlist:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('playlist:remove', doc);
}
