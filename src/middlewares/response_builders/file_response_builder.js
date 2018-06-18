const pjson = require('../../../package.json');

function FileResponseBuilder(logger) {
  let _logger = logger;

  function emptyIfNull(o) {
    return (o === null || o === undefined) ? '' : o;
  }

  this.buildSingleResponse = function(req, res, successStatusCode) {
    let file = res.file;

    let response = getBasicSingleResponse();
    response.metadata.version = pjson.version;
    response.file.id = file.id;
    response.file._rev = file._rev;
    response.file.createdTime = file.createdTime;
    response.file.updatedTime = file.updatedTime;
    response.file.size = file.size;
    response.file.filename = file.filename;
    response.file.resource = file.resource;
    response.file.owner = emptyIfNull(file.owner);

    _logger.debug('Response: %j', response);
    res.status(successStatusCode).json(response);
  };

  function getBasicSingleResponse() {
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
        owner: '',
      },
    };
  }

  this.buildSetResponse = function(req, res) {
    let files = res.files;

    let response = getBasicSetResponse();
    response.metadata.version = pjson.version;

    files.forEach( (file) => {
      let fileResponse = {};
      fileResponse.id = file.id;
      fileResponse.name = file.name;
      fileResponse._rev = file._rev;
      fileResponse.createdTime = file.createdTime;
      fileResponse.updatedTime = file.updatedTime;
      fileResponse.size = file.size;
      fileResponse.filename = file.filename;
      fileResponse.resource = file.resource;
      fileResponse.owner = emptyIfNull(file.owner);
      response.files.push(fileResponse);
    });

    _logger.debug('Response: %j', response);
    res.status(200).json(response);
  };

  function getBasicSetResponse() {
    return {
      metadata: {
        version: '',
      },
      files: [],
    };
  }
}

module.exports = FileResponseBuilder;
