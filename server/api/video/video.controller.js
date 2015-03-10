'use strict';

var _ = require('lodash');
var Video = require('./video.model');

// Get list of videos
exports.index = function(req, res) {
  Video.find(function (err, videos) {
    if(err) { return handleError(res, err); }
    return res.json(200, videos);
  });
};

// Get a single video
exports.show = function(req, res) {
  Video.findById(req.params.id, function (err, video) {
    if(err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    return res.json(video);
  });
};

// Creates a new video in the DB.
exports.create = function(req, res) {
  Video.create(req.body, function(err, video) {
    if(err) { return handleError(res, err); }
    return res.json(201, video);
  });
};

// Creates a new video in the DB.
exports.vote = function(req, res) {
  //console.log('Voting...');
  //console.log(req.body);
  if(req.body._id) { delete req.body._id; }
  Video.findById(req.body.id, function (err, video) {
    if (err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    //var updated = _.merge(video, req.body);

    video.addVote();
    //video.votes.push({ date: now });
    //video.score += video.votes.length * now;
    video.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, video);
    });
  });
};

// Creates a new video in the DB.
exports.addSong = function(req, res) {

  console.log('ID: ' + req.body.newSong.id.videoId);

  Video.findOne({ videoId: req.body.newSong.id.videoId }, function(err, video) {

    if(err) {
      console.log('There was an error finding the video...' + video);
      return;
    }

    if(video) {

      console.log('Video ' + video + ' found.');
      video.addVote();
      video.save();

    }
    else {

      console.log('Video ' + video + ' not found, adding...');

      Video.create({

        videoId: req.body.newSong.id.videoId,
        title: req.body.newSong.snippet.title

      }, function(err, video) {
        if(err) { return handleError(res, err); }
        return res.json(201, video);
      });

    }

  });

  /*
  Video.create(req.body, function(err, video) {
    if(err) { return handleError(res, err); }
    return res.json(201, video);
  });
  */

};

// Updates an existing video in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Video.findById(req.params.id, function (err, video) {
    if (err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    var updated = _.merge(video, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, video);
    });
  });
};

// Deletes a video from the DB.
exports.destroy = function(req, res) {
  Video.findById(req.params.id, function (err, video) {
    if(err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    video.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
