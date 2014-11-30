'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChatSchema = new Schema({
  date: { type: Date, default: Date.now() },
  body: { type: String },
  _user: { type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Chat', ChatSchema);
