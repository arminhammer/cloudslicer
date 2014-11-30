'use strict';

var _ = require('lodash');
var Playlog = require('./playlog.model');

// Get list of playlogs
exports.indexLimited = function(req, res) {
  Playlog.find({})
    .sort('-date')
    .limit(req.params.limit)
    .populate('_song')
    .exec(function (err, playlogs) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(playlogs);
    });
};

/*
// Get list of playlogs
exports.index = function(req, res) {
  Playlog.find({})
    .sort('-date')
    .populate('_song')
    .exec(function (err, playlogs) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(playlogs);
    });
};

// Get a single playlog
exports.show = function(req, res) {
  Playlog.findById(req.params.id, function (err, playlog) {
    if(err) { return handleError(res, err); }
    if(!playlog) { return res.send(404); }
    return res.json(playlog);
  });
};

// Creates a new playlog in the DB.
exports.create = function(req, res) {
  Playlog.create(req.body, function(err, playlog) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(playlog);
  });
};

// Updates an existing playlog in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Playlog.findById(req.params.id, function (err, playlog) {
    if (err) { return handleError(res, err); }
    if(!playlog) { return res.send(404); }
    var updated = _.merge(playlog, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(playlog);
    });
  });
};

// Deletes a playlog from the DB.
exports.destroy = function(req, res) {
  Playlog.findById(req.params.id, function (err, playlog) {
    if(err) { return handleError(res, err); }
    if(!playlog) { return res.send(404); }
    playlog.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
*/

function handleError(res, err) {
  return res.send(500, err);
}
