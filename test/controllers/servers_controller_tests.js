var proxyquire = require('proxyquire');
var sinon = require('sinon');
var supertest = require('supertest');

var express = require('express');
var request;

before(function () {
    var app = express();
    var route = proxyquire('../../controllers/servers_controller.js', {});
    route(app);
    request = supertest(app);
});

describe('ServersController Tests', function(){

    describe('GET /servers', function () {
        it('should respond with a 200', function (done) {
            request
                .get('/api/servers')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

    describe('GET /servers/:serverId', function () {
        it('should respond with a 200', function (done) {
            request
                .get('/api/servers/15')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

    describe('PUT /servers/:serverId', function () {
        it('should respond with a 200', function (done) {
            request
                .put('/api/servers/15')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

    describe('DELETE /servers/:serverId', function () {
        it('should respond with a 200', function (done) {
            request
                .delete('/api/servers/15')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

    describe('POST /servers', function () {
        it('should respond with a 200', function (done) {
            request
                .post('/api/servers')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

    describe('POST /servers/:serverId', function () {
        it('should respond with a 200', function (done) {
            request
                .post('/api/servers/15')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

});