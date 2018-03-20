var proxyquire = require('proxyquire');
var sinon = require('sinon');
var supertest = require('supertest');

var express = require('express');
var request;

before(function () {
    var app = express();
    var route = proxyquire('../../controllers/users_controller.js', {});
    route(app);
    request = supertest(app);
});

describe('UsersController Tests', function(){

    describe('POST /authorize', function () {
        it('should respond with a 200', function (done) {
            request
                .post('/api/authorize')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

    describe('POST /token', function () {
        it('should respond with a 200', function (done) {
            request
                .post('/api/token')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });
    });

});