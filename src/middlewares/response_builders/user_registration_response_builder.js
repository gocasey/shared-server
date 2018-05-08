const pjson = require('../../../package.json');

function UserRegistrationResponseBuilder(logger) {
  let _logger = logger;

  this.buildResponse = function(req, res) {
    let user = res.data;

    let response = getBasicResponse();
    response.metadata.version = pjson.version;
    response.user.id = user.user_id;
    response.user._rev = user._rev;
    response.user.username = user.username;
    response.user.applicationOwner = 'mockAppOwner';
    _logger.debug('Response: %j', response);
    res.json(response);
  };

  function getBasicResponse() {
    return {
      metadata: {
        version: '',
      },
      user: {
        id: '',
        _rev: '',
        applicationOwner: '',
        username: '',
      },
    };
  }
}

module.exports = UserRegistrationResponseBuilder;
