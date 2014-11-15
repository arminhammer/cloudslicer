'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaylistSchema = new Schema({

  position: Number,
  _song: { type: Schema.Types.ObjectId, ref: 'Song'},
  votes: Number,
  played: Boolean

});

module.exports = mongoose.model('Playlist', PlaylistSchema);
