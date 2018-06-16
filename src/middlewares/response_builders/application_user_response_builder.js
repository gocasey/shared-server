const pjson = require('../../../package.json');

function ApplicationUserResponseBuilder(logger) {
  let _logger = logger;

  this.buildResponse = function(req, res) {
    let user = res.data;

    let response = getBasicResponse();
    response.metadata.version = pjson.version;
    response.user.id = user.user_id;
    response.user._rev = user._rev;
    response.user.username = user.username;
    response.user.applicationOwner = user.applicationOwner;
    _logger.debug('Response: %j', response);
    res.status(200).json(response);
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

module.exports = ApplicationUserResponseBuilder;
