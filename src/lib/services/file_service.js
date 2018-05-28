const fs = require('fs');
const path = require('path');
const util = require('util');
const BaseHttpError = require('../../errors/base_http_error.js');
const FileModel = require('../../models/file_model.js');
const GoogleUploadService = require('./google_upload_service.js');

function FileService(logger, postgrePool) {
  let _logger = logger;
  let _google = new GoogleUploadService(logger);
  let _fileModel = new FileModel(logger, postgrePool);

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

  async function getFileSize(fileName) {
    let fileStatsAsync = util.promisify(fs.stat);
    let fileStats = await fileStatsAsync(fileName);
    return fileStats.size;
  }

  async function createRemoteFile(body) {
    let fileData = {
      encodedFile: body.file,
      name: body.metadata.name,
    };
    let localFilepath = await createLocalFile(fileData);
    let uploadedFile;
    try {
      uploadedFile = await _google.uploadFromLocal(localFilepath);
    } catch (err) {
      _logger.error('An error occurred while uploading the file: %s', localFilepath);
      throw err;
    }
    uploadedFile.size = await getFileSize(localFilepath);
    return uploadedFile;
  };

  this.createFile = async (body) => {
    try {
      let uploadedFile = await createRemoteFile(body);
      let savedFile = await _fileModel.create(uploadedFile);
      return savedFile;
    } catch (err) {
      throw new BaseHttpError('File creation error', 500);
    }
  };
}

module.exports = FileService;
