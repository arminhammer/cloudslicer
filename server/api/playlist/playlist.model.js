'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaylistSchema = new Schema({

  _song: { type: Schema.Types.ObjectId, ref: 'Song'},
  votes: Number,
  played: Number

});

module.exports = mongoose.model('Playlist', PlaylistSchema);
