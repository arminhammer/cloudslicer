'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SongSchema = new Schema({

  title: String,
  artist: String,
  inPlaylist: Boolean,
  source: String,
  length: Number,
  url: String,
  videoId: {
    type:String,
    unique: true
  },
  publishedAt: Date,
  channelId: String,
  description: String,
  thumbnails: {
    default: {
      url: String
    },
    medium: {
      url: String
    },
    high: {
      url: String
    }
  },
  channelTitle: String,
  liveBroadcastContent: String,
  votes: Number,
  _submitter: { type: Number, ref: 'User'},
  active: Boolean
});

module.exports = mongoose.model('Song', SongSchema);
