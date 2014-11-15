'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaylogSchema = new Schema({

  //position: Number,
  date: Date,
  _song: { type: Schema.Types.ObjectId, ref: 'Song'},
  votes: Number

});

module.exports = mongoose.model('Playlog', PlaylogSchema);
