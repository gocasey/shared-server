const UserService = require('../../lib/services/user_service.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function PasswordAuthenticator(logger, postgrePool) {
    let _userService = new UserService(logger, postgrePool);

    this.authenticate = function(req, res, next) {
        if (req.body.password) {
            _userService.authenticateWithPassword(req.body.username, req.body.password, function(err) {
                if (err) {
                    let error = new BaseHttpError('Unauthorized', 'Unauthorized', 401);
                    next(error);
                }
                else{
                  next();
                }
            });
        }
        else{
          let error = new BaseHttpError('Wrong request', 'Wrong request', 400);
          next(error);
        }
    };
}

module.exports = PasswordAuthenticator;
