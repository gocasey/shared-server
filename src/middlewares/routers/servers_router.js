const express = require('express');

function ServersRouter(app) {
    let router = new express.Router();
    app.use('/api/servers', router);

    router.get('/', function(req, res, next) {
        res.end('Hit GET servers');
    });

    router.post('/', function(req, res, next) {
        res.end('Hit POST servers');
    });

    router.get('/:serverId', function(req, res, next) {
        res.end('Hit GET servers/' + req.params.serverId);
    });

    router.post('/:serverId', function(req, res, next) {
        res.end('Hit POST servers/' + req.params.serverId);
    });

    router.put('/:serverId', function(req, res, next) {
        res.end('Hit PUT servers/' + req.params.serverId);
    });

    router.delete('/:serverId', function(req, res, next) {
        res.end('Hit POST servers/' + req.params.serverId);
    });
}


module.exports = ServersRouter;
