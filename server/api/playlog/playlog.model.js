'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaylogSchema = new Schema({

  //position: Number,
  date: { type: Date, default: Date.now() },
  _song: { type: Schema.Types.ObjectId, ref: 'Song'},
  votes: [{ type: Schema.Types.ObjectId, ref: 'Vote' }]

});

module.exports = mongoose.model('Playlog', PlaylogSchema);
