const fs = require('fs');
const path = require('path');
const util = require('util');
const GoogleUploadService = require('./google_upload_service.js');

function FileService(logger, postgrePool) {
  let _logger = logger;
  let _google = new GoogleUploadService(logger);

  async function createLocalFile(fileData) {
    let decodedFile = new Buffer(fileData.encodedFile, 'base64');
    let filename = Date.now() + fileData.name;
    let filepath = path.join('temp', 'uploads', filename);
    let writePromise = util.promisify(fs.writeFile);
    try {
      await writePromise(filepath, decodedFile);
    } catch (err) {
      _logger.error('An error occurred while creating the local copy for file: %s', filepath);
      throw err;
    }
    return filepath;
  }

  this.createFile = async (body) => {
    let fileData = {
      encodedFile: body.file,
      name: body.metadata.name,
    };
    let localFilepath = await createLocalFile(fileData);
    try {
      return await _google.uploadFromLocal(localFilepath);
    } catch (err) {
      _logger.error('An error occurred while uploading the file: %s', localFilepath);
      _logger.error(err);
      throw err;
    }
  };
}

module.exports = FileService;
