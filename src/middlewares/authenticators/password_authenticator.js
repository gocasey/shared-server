var UserService = require('../../lib/services/user_service.js');

function PasswordAuthenticator(logger, postgrePool){

    var _logger = logger;
    var _userService = new UserService(logger, postgrePool);

    this.authenticate = function(req, res, next) {
        if (req.body.password) {
            _userService.authenticateWithPassword(req.body.username, req.body.password, function (err) {
                if (err) {
                    var error = new BaseHttpError('Unauthorized', 'Unauthorized', 401);
                    res.status(401).json(error);
                    next(error);
                }
            });
        }
        next();
    };
}

module.exports = PasswordAuthenticator;