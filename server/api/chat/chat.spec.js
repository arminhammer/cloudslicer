'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/chats', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/chats')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('POST /api/chats', function() {

  it('should respond with a 201 status', function(done) {
    request(app)
      .post('/api/chats')
      .send({ date: Date.now(), body: 'This is a test chat!' })
      .end(function(err, res) {
        if (err) return done(err);
        done();
      })
      .expect(201);
  });
});

