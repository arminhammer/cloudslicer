'use strict';

var express = require('express');
var controller = require('./song.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/vote', controller.addVote);
router.post('/add', controller.addSong);

/*
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
*/

module.exports = router;
