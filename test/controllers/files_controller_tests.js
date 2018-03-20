var proxyquire = require('proxyquire');
var sinon = require('sinon');
var supertest = require('supertest');

var express = require('express');
var request;

before(function () {
    var app = express();
    var route = proxyquire('../../controllers/files_controller.js', {});
    route(app);
    request = supertest(app);
});

describe('FilesController Tests', function(){

    describe('GET /files', function () {
        it('should respond with a 200', function (done) {
            request
                .get('/api/files')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

    describe('GET /files/:fileId', function () {
        it('should respond with a 200', function (done) {
            request
                .get('/api/files/15')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

    describe('PUT /files/:fileId', function () {
        it('should respond with a 200', function (done) {
            request
                .put('/api/files/15')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

    describe('DELETE /files/:fileId', function () {
        it('should respond with a 200', function (done) {
            request
                .delete('/api/files/15')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

    describe('POST /files', function () {
        it('should respond with a 200', function (done) {
            request
                .post('/api/files')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

    describe('POST /files/upload', function () {
        it('should respond with a 200', function (done) {
            request
                .post('/api/files/upload')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

});