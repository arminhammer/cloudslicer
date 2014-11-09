'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SongSchema = new Schema({
  title: String,
  artist: String,
  info: String,
  inPlaylist: Boolean,
  source: String,
  url: {
    full: String,
    youtubeid: String
  },
  votes: {
    current: Number,
    total: Number
  }
});

module.exports = mongoose.model('Song', SongSchema);
