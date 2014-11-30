'use strict';

var _ = require('lodash');
var Playlist = require('./playlist.model');

//playList.addTrack({ title: 'Title1', tLength: 5000, votes: {current: 5 } });
//playList.addTrack({ title: 'Title2', tLength: 7000, votes: {current: 15 } });
//playList.addTrack({ title: 'Title3', tLength: 15500, votes: {current: 2 }});

//playList.start();


// Get list of playlists
exports.index = function(req, res) {
  Playlist.find({ })
    .populate('_song')
    .exec(function (err, playlists) {
      if(err) {
        return handleError(res, err);
      }
      return res.status(200).json(playlists);
    });
};

/*
// Get a single playlist
exports.current = function(req, res) {
  Playlist.find({ played: 1 })
    .sort('-position')
    .limit(1)
    .populate('_song')
    .exec(function (err, playlist) {
      if(err) { return handleError(res, err); }
      if(!playlist) { return res.send(404); }
      return res.status(200).json(playlist);
    });
};

exports.playLog = function(req, res) {
  Playlist.find({ played: 2 })
    .sort('-position')
    .limit(10)
    .populate('_song')
    .exec(function (err, playlist) {
      if(err) { return handleError(res, err); }
      if(!playlist) { return res.send(404); }
      return res.status(200).json(playlist);
    });
};

// Get a single playlist
exports.show = function(req, res) {
  Playlist.findById(req.params.id, function (err, playlist) {
    if(err) { return handleError(res, err); }
    if(!playlist) { return res.send(404); }
    return res.status(200).json(playlist);
  });
};

// Creates a new playlist in the DB.
exports.create = function(req, res) {
  Playlist.create(req.body, function(err, playlist) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(playlist);
  });
};

// Updates an existing playlist in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Playlist.findById(req.params.id, function (err, playlist) {
    if (err) { return handleError(res, err); }
    if(!playlist) { return res.send(404); }
    var updated = _.merge(playlist, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(playlist);
    });
  });
};

// Deletes a playlist from the DB.
exports.destroy = function(req, res) {
  Playlist.findById(req.params.id, function (err, playlist) {
    if(err) { return handleError(res, err); }
    if(!playlist) { return res.send(404); }
    playlist.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
*/

function handleError(res, err) {

  return res.send(500, err);
}
