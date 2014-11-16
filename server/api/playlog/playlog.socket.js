/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Playlog = require('./playlog.model');

exports.register = function(socket) {

  Playlog.schema.post('save', function (doc) {

    Playlog.findById(doc._id).
      populate('_song')
      .exec(function(err, popDoc) {

        onSave(socket, popDoc);

      });

  });

  Playlog.schema.post('remove', function (doc) {

    onRemove(socket, doc);

  });

};

function onSave(socket, doc, cb) {
  socket.emit('playlog:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('playlog:remove', doc);
}
