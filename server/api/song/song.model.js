'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SongSchema = new Schema({
  title: String,
  artist: String,
  inPlaylist: Boolean,
  source: String,
  url: {
    full: String,
    youtubeid: String
  },
  votes: {
    current: Number,
    total: Number
  },
  _submitter: { type: Number, ref: 'User'}
});

module.exports = mongoose.model('Song', SongSchema);
