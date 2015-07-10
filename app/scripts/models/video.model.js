/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var VideoModel = function(data) {
  this.title = m.prop(data.title);
  this.description = m.prop(data.description);
  this.youtubeID = m.prop(data.youtubeID);
  this.score = m.prop(data.score);
};

module.exports = VideoModel;
