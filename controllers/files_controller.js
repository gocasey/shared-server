var express = require('express');

function FilesController(app) {

    var router = express.Router();
    app.use('/api/files', router);

    router.get('/', function (req, res, next) {
        res.end('Hit GET files');
    });

    router.post('/', function (req, res, next) {
        res.end('Hit POST files');
    });

    router.get('/:fileId', function (req, res, next) {
        res.end('Hit GET files/' + req.params.fileId);
    });

    router.put('/:fileId', function (req, res, next) {
        res.end('Hit PUT files/' + req.params.fileId);
    });

    router.delete('/:fileId', function (req, res, next) {
        res.end('Hit DELETE files/' + req.params.fileId);
    });

    router.post('/upload', function (req, res, next) {
        res.end('Hit POST files/upload');
    });
}


module.exports = FilesController;