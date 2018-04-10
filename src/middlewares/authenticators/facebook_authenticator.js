var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

function FacebookAuthenticator(logger){

    var _logger = logger;

    this.authenticate = function (req, res, next) {
        var facebookToken = req.body.facebookAuthToken;

        passport.use(new FacebookStrategy({
                clientID: req.body.username,
                clientSecret: process.env.CLIENT_SECRET
            },
            function(accessToken, refreshToken, profile, cb) {
                User.findOrCreate({ facebookId: profile.id }, function (err, user) {
                    return cb(err, user);
                });
            }));

        if (facebookToken){
            passport.authenticate('facebook');
        }
    }
}

module.exports = FacebookAuthenticator;