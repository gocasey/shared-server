const pjson = require('../../../package.json');

function FileResponseBuilder(logger) {
  let _logger = logger;

  this.buildResponse = function(req, res) {
    let file = res.file;

    let response = getBasicResponse();
    response.metadata.version = pjson.version;
    response.file.filename = file.id;
    response.file.resource = file.uri;

    _logger.debug('Response: %j', response);
    res.status(200).json(response);
  };

  function getBasicResponse() {
    return {
      metadata: {
        version: '',
      },
      file: {
        //id: '',
        //_rev: '',
        //createdTime: '',
        //updatedTime: '',
        //size: '',
        filename: '',
        resource: '',
      },
    };
  }
}

module.exports = FileResponseBuilder;
