var express = require('express');
var logger = require('morgan');

var filesController = require('./controllers/files_controller.js');
var serversController = require('./controllers/servers_controller.js');
var usersController = require('./controllers/users_controller.js');

var app = express();
app.use(logger('dev'));

filesController(app);
serversController(app);
usersController(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.end("Error");
});

module.exports = app;
