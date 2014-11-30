'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/songs', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/songs')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('POST /api/songs/add', function() {

  it('should respond with a 201 status', function(done) {
    request(app)
      .post('/api/songs/add')
      .send({
        newSong: {
          id: {
            videoId: 'mbyzgeee2mg'
          },
          snippet: {
            title: 'Test Title',
            thumbnails: {
              default: {
                url: 'testUrl'
              },
              medium: {
                url: 'testUrl'
              },
              high: {
                url: 'testUrl'
              }
            }
          }
        },
        user: {
          id: '001'
        }
      })
      .end(function(err, res) {
        if (err) return done(err);
        done();
      })
      .expect(201);
  });
});

describe('POST /api/songs/vote', function() {

  it('should respond with a 201 status', function(done) {
    request(app)
      .post('/api/songs/vote')
      .send({
        song: {
          _id: '001'
        }
      })
      .end(function(err, res) {
        if (err) return done(err);
        done();
      })
      .expect(201);
  });
});

