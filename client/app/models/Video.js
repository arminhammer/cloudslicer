// Video model

var Video = function(data) {
  this.title = m.prop(data.title);
  this.description = m.prop(data.description);
  this.youtubeID = m.prop(data.youtubeID);
};

module.exports = Video;
