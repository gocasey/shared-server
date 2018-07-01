const AdminUserTokenGenerationService = require('../services/admin_user_token_generation_service.js');
const ApplicationUserTokenGenerationService = require('../services/application_user_token_generation_service.js');
const TokenGenerationService = require('../services/token_generation_service.js');

function UserTokenGenerationServiceFactory(logger) {
  let _logger = logger;
  let _tokenGenerationService = new TokenGenerationService(logger);

  this.getAdminUserTokenGenerationService = () => {
    return new AdminUserTokenGenerationService(_logger, _tokenGenerationService);
  };

  this.getApplicationUserTokenGenerationService = () => {
    return new ApplicationUserTokenGenerationService(_logger, _tokenGenerationService);
  };
}

module.exports = UserTokenGenerationServiceFactory;
