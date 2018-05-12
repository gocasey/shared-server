const UserService = require('../../lib/services/user_service.js');
const BaseHttpError = require('../../errors/base_http_error.js');

function TokenAuthenticator(logger, postgrePool) {
    let _userService = new UserService(logger, postgrePool);

    this.authenticate = function(req, res, next) {
        let token = req.query.token;
        if (token) {
            _userService.authenticateWithToken(req.body.username, token, function(err) {
                if (err) {
                    let error = new BaseHttpError('Unauthorized', 401);
                    next(error);
                } else {
                  next();
                }
            });
        } else {
            let error = new BaseHttpError('Unauthorized', 401);
            next(error);
        }
    };
}

module.exports = TokenAuthenticator;
