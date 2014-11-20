'use strict';

var _ = require('lodash');
var Song = require('./song.model');
var Playlist = require('../playlist/playlist.model');

// Get list of songs
exports.index = function(req, res) {
  Song.find({ }, function (err, songs) {
    if(err) { return handleError(res, err); }
    return res.json(200, songs);
  });
};

// Get a single song
exports.show = function(req, res) {
  Song.findById(req.params.id, function (err, song) {
    if(err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    return res.json(song);
  });
};

// Creates a new song in the DB.
exports.create = function(req, res) {
  Song.create(req.body, function(err, song) {
    if(err) { return handleError(res, err); }
    return res.json(201, song);
  });
};

// Updates an existing song in the DB.
exports.addVote = function(req, res) {
  //if(req.body._id) { delete req.body._id; }
  Song.findById(req.params.id, function (err, song) {
    if (err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    song.votes++;

    Playlist.find({ _song: song }, function(err, hit) {
      if (err) { return handleError(res, err); }

      if(hit.length > 0) {
        console.log('Found hit');
        console.log(hit[0]);
        hit[0].votes++;
        hit[0].save();
      }
      else {
        console.log('Found no hit');
        console.log(hit);
        Playlist.create({ _song: song._id, votes: 1 }, function() {
          console.log('Added %s to playlist.', song.title);
        })
      }

    });

    if(!song.inPlaylist) {
      song.inPlaylist = true;
    }
    song.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, song);
    });
  });
};

exports.addSong = function(req, res) {

  console.log('Adding song...');
  console.log(req.body);
  Song.find({ videoId: req.body.id.videoId }, function (err, songs) {
    if (err) { return handleError(res, err); }
    if(songs.length > 1) {
      console.log('Found song in the list already!');
      console.log(songs[0]);
    }
    else {
      console.log('Song is not in the catalog yet.');

    }
  });

};

// Updates an existing song in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Song.findById(req.params.id, function (err, song) {
    if (err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    var updated = _.merge(song, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, song);
    });
  });
};

// Deletes a song from the DB.
exports.destroy = function(req, res) {
  Song.findById(req.params.id, function (err, song) {
    if(err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    song.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
