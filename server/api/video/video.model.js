'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VideoSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,
  title: String,
  description: String,
  url: String
});

module.exports = mongoose.model('Video', VideoSchema);
