'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaylistSchema = new Schema({

  _song: { type: Schema.Types.ObjectId, ref: 'Song'},
  votes: [{ type: Schema.Types.ObjectId, ref: 'Vote' }]

});

module.exports = mongoose.model('Playlist', PlaylistSchema);
