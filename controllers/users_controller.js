var express = require('express');

function UsersController(app) {

    var router = express.Router();

    app.post('/api/token', function (req, res, next) {
        res.end('Hit POST token');
    });

    app.post('/api/authorize', function (req, res, next) {
        res.end('Hit POST authorize');
    });
}


module.exports = UsersController;
