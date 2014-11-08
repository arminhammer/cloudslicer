'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SongSchema = new Schema({
  title: String,
  info: String,
  inPlaylist: Boolean,
  votes: Number
});

module.exports = mongoose.model('Song', SongSchema);
