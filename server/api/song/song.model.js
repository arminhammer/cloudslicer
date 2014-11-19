'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SongSchema = new Schema({

  title: String,
  artist: String,
  inPlaylist: Boolean,
  source: String,
  length: Number,
  url: {
    full: String,
    youtubeid: {
      type:String,
      unique: true
    }
  },
  votes: Number,
  _submitter: { type: Number, ref: 'User'},
  active: Boolean
});

module.exports = mongoose.model('Song', SongSchema);
