'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SongSchema = new Schema({

  title: String,
  artist: String,
  source: String,
  length: Number,
  url: String,
  videoId: {
    type: String,
    unique: true
  },
  publishedAt: Date,
  channelId: String,
  description: String,
  thumbnailUrlDefault: String,
  thumbnailUrlMedium: String,
  thumbnailUrlHigh: String,
  channelTitle: String,
  liveBroadcastContent: String,
  votes: [{ type: Schema.Types.ObjectId, ref: 'Vote' }],
  _submitter: { type: Number, ref: 'User'},
  active: Boolean,
  label: [String],
  playcount: Number
});

module.exports = mongoose.model('Song', SongSchema);
