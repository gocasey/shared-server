const AdminUserTokenAuthenticator = require('./admin_user_token_authenticator.js');
const ServerTokenAuthenticator = require('./server_token_authenticator.js');

function AdminTokenAuthenticator(logger, postgrePool) {
  let _serverTokenAuthenticator = new ServerTokenAuthenticator(logger, postgrePool);
  let _adminUserTokenAuthenticator = new AdminUserTokenAuthenticator(logger, postgrePool);

  this.authenticateFromHeader = async (req, res, next) => {
    _serverTokenAuthenticator.authenticateFromHeader(req, res, function(err) {
      if (err) {
        return _adminUserTokenAuthenticator.authenticateFromHeader(req, res, next);
      } else {
        return next();
      }
    });
  };
}

module.exports = AdminTokenAuthenticator;
