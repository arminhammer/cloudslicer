'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaylistSchema = new Schema({

  position: Number,
  song: { type: String, ref: 'Song'},
  votes: Number,
  playing: Boolean

});

module.exports = mongoose.model('Playlist', PlaylistSchema);
