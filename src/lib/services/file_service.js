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
    let fileDirectory = path.join('temp', 'uploads');
    if (!fs.existsSync(fileDirectory)) {
      fs.mkdirSync('temp');
      fs.mkdirSync(fileDirectory);
    }
    let filepath = path.join(fileDirectory, filename);
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

  async function createRemoteFile(fileData) {
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

  this.createFile = async (fileData) => {
    try {
      let uploadedFile = await createRemoteFile(fileData);
      let savedFile = await _fileModel.create(uploadedFile);
      return savedFile;
    } catch (err) {
      _logger.error('Error during file creation: %s', err);
      throw new BaseHttpError('File creation error', 500);
    }
  };

  this.updateFile = async (fileData) => {
    try {
      return await _fileModel.update(fileData);
    } catch (updateErr) {
      _logger.error('An error happened while updating the file with id: \'%s\'', fileData.id);
      if (updateErr.message == 'File does not exist') {
        throw new BaseHttpError(updateErr.message, 404);
      } else if (updateErr.message == 'Integrity check error') {
        throw new BaseHttpError(updateErr.message, 409);
      } else throw new BaseHttpError('File update error', 500);
    }
  };
}

module.exports = FileService;
