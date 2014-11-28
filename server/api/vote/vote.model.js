'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VoteSchema = new Schema({
  user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  date: Date,
  active: Boolean
});

module.exports = mongoose.model('Vote', VoteSchema);
