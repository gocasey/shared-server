const pjson = require('../../../package.json');

function FileResponseBuilder(logger) {
  let _logger = logger;

  this.buildResponse = function(req, res) {
    let file = res.file;

    let response = getBasicResponse();
    response.metadata.version = pjson.version;
    response.file.id = file.file_id;
    response.file._rev = file._rev;
    response.file.createdTime = file.created_time;
    response.file.updatedTime = file.updated_time;
    response.file.size = file.size;
    response.file.filename = file.file_name;
    response.file.resource = file.resource;

    _logger.debug('Response: %j', response);
    res.status(200).json(response);
  };

  function getBasicResponse() {
    return {
      metadata: {
        version: '',
      },
      file: {
        id: '',
        _rev: '',
        createdTime: '',
        updatedTime: '',
        size: '',
        filename: '',
        resource: '',
      },
    };
  }
}

module.exports = FileResponseBuilder;
