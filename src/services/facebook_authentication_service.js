var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

function FacebookAuthenticationService(logger){

    var _logger = logger;

    this.authenticate = function(facebookId, facebookToken, callback){

    }
}

module.exports = FacebookAuthenticationService;