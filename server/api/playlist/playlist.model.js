'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaylistSchema = new Schema({

  current: Number,
  tracks: [{ date: Date, { type: Number, ref: 'Song' }}]

});

module.exports = mongoose.model('Playlist', PlaylistSchema);
