'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VideoSchema = new Schema({

  name: String,
  info: String,
  active: Boolean,
  title: String,
  description: String,
  url: String,
  score: { type: Number, default: 0 },
  votes: [{ date: Date }]

});

module.exports = mongoose.model('Video', VideoSchema);
