const AdminUserTokenGenerationService = require('../services/admin_user_token_generation_service.js');
const ApplicationUserTokenGenerationService = require('../services/application_user_token_generation_service.js');

function UserTokenGenerationServiceFactory(logger) {
  let _logger = logger;

  this.getAdminUserTokenGenerationService = () => {
    return new AdminUserTokenGenerationService(logger);
  }

  this.getApplicationUserTokenGenerationService = () => {
    return new ApplicationUserTokenGenerationService(logger);
  }

}

module.exports = UserTokenGenerationServiceFactory;