const UserService = require('../../lib/services/user_service.js');

function TokenAuthenticator(logger, postgrePool) {
    let _userService = new UserService(logger, postgrePool);

    this.authenticate = function(req, res, next) {
        let token = req.query.token;
        if (token) {
            _userService.authenticateWithToken(req.body.username, token, function(err) {
                if (err) {
                    let error = new BaseHttpError('Unauthorized', 'Unauthorized', 401);
                    res.status(401).json(error);
                    next(error);
                }
            });
        } else {
            let error = new BaseHttpError('Unauthorized', 'Unauthorized', 401);
            res.status(401).json(error);
            next(error);
        }
        next();
    };
}

module.exports = TokenAuthenticator;
