'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VideoSchema = new Schema({

  name: String,
  info: String,
  active: Boolean,
  title: String,
  description: String,
  videoId: String,
  score: { type: Number, default: 0 },
  votes: [{ date: Date }],
  sources: [{ src: String }]

});

/**
 * Virtuals
 */
//VideoSchema
//.virtual('sources')
//.get(function() {
//return 'Fun!';
//  });

/**
 * Methods
 */
VideoSchema.methods = {

  addVote: function() {

    var now = Date.now();
    console.log(now);

    this.votes.push({ date: now });
    this.score += this.votes.length * now;

  }

};

module.exports = mongoose.model('Video', VideoSchema);
