const StatsController = require('../../controllers/stats_controller.js');
const AdminUserTokenAuthenticator = require('../../middlewares/authenticators/admin_user_token_authenticator.js');
const UserStatsResponseBuilder = require('../../middlewares/response_builders/users_stats_response_builder.js');

function StatsRouter(app, logger, postgrePool) {
  let _statsController = new StatsController(logger, postgrePool);
  let _adminUserTokenAuthenticator = new AdminUserTokenAuthenticator(logger, postgrePool);
  let _userStatsResponseBuilder = new UserStatsResponseBuilder(logger);

  app.get('/api/stats/users',
    _adminUserTokenAuthenticator.authenticateFromHeader,
    _statsController.getTotalUsersCountByServer,
    _statsController.getActiveUsersCountByServer,
    _userStatsResponseBuilder.buildResponse,
  );
}


module.exports = StatsRouter;
