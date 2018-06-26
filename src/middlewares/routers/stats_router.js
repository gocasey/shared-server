const StatsController = require('../../controllers/stats_controller.js');
const ServerController = require('../../controllers/server_controller.js');
const AdminUserTokenAuthenticator = require('../../middlewares/authenticators/admin_user_token_authenticator.js');
const StatsResponseBuilder = require('../../middlewares/response_builders/stats_response_builder.js');
const UserStatsResponseBuilder = require('../../middlewares/response_builders/users_stats_response_builder.js');

function StatsRouter(app, logger, postgrePool) {
  let _statsController = new StatsController(logger, postgrePool);
  let _serverController = new ServerController(logger, postgrePool);
  let _adminUserTokenAuthenticator = new AdminUserTokenAuthenticator(logger, postgrePool);
  let _userStatsResponseBuilder = new UserStatsResponseBuilder(logger);
  let _statsResponseBuilder = new StatsResponseBuilder(logger);

  app.get('/api/stats/users',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _statsController.getTotalUsersCountByServer,
    _statsController.getActiveUsersCountByServer,
    _userStatsResponseBuilder.buildResponse,
  );

  app.get('/api/stats/stories',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _serverController.getAllServers,
    _statsController.getStoriesByServer,
    _statsResponseBuilder.buildResponse,
  );

  app.get('/api/stats/requests',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _serverController.getAllServers,
    _statsController.getRequestsByServer,
    _statsResponseBuilder.buildResponse,
  );
}

module.exports = StatsRouter;
