const fs = require('fs');
const util = require('util');
const BaseHttpError = require('../../errors/base_http_error.js');
const FileModel = require('../../models/file_model.js');
const GoogleUploadService = require('./google_upload_service.js');

function FileService(logger, postgrePool) {
  let _logger = logger;
  let _google = new GoogleUploadService(logger);
  let _fileModel = new FileModel(logger, postgrePool);

  async function getFileSize(fileName) {
    let fileStatsAsync = util.promisify(fs.stat);
    let fileStats = await fileStatsAsync(fileName);
    return fileStats.size;
  }

  async function createRemoteFile(localFilepath) {
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

  this.loadFileAndUpload = async (filePath) => {
    try {
      let uploadedFile = await createRemoteFile(filePath);
      let savedFile = await _fileModel.create(uploadedFile);
      return savedFile;
    } catch (err) {
      _logger.error('Error during file creation: %s', err);
      throw new BaseHttpError('File creation error', 500);
    }
  };

  this.updateFile = async (fileData) => {
    let fileToUpdate = await _fileModel.findByFileId(fileData.id);
    if (fileToUpdate) {
      if (fileToUpdate.filename !== fileData.filename) {
        let remoteFile;
        try {
          remoteFile = await _google.updateRemoteFilename(fileToUpdate.filename, fileData.filename);
        } catch (err) {
          throw new BaseHttpError('Remote file update error', 500);
        }
        fileData.resource = remoteFile.resource;
      }
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
    } else throw new BaseHttpError('File does not exist', 404);
  };

  this.deleteFile = async (fileId) => {
    let deletedFile;
    try {
      deletedFile = await _fileModel.delete(fileId);
    } catch (deleteErr) {
      _logger.error('An error happened while deleting the file with id: \'%s\'', fileId);
      if (deleteErr.message == 'File does not exist') {
        throw new BaseHttpError(deleteErr.message, 404);
      } else throw new BaseHttpError('File delete error', 500);
    }
    try {
      return await _google.deleteRemoteFile(deletedFile.filename);
    } catch (err) {
      throw new BaseHttpError('Remote file delete error', 500);
    }
  };

  this.findFile = async (fileId) => {
    let file;
    try {
      file = await _fileModel.findByFileId(fileId);
    } catch (findErr) {
      _logger.error('An error happened while looking for the file with id: \'%s\'', fileId);
      throw new BaseHttpError('File find error', 500);
    }
    if (file) {
      return file;
    } else {
      _logger.error('The file with id: \'%s\' was not found', fileId);
      throw new BaseHttpError('File does not exist', 404);
    }
  };

  this.findServerFiles = async (serverId) => {
    try {
      return await _fileModel.findByServerId(serverId);
    } catch (findErr) {
      _logger.error('An error happened while retrieving the files for server_id: %s', serverId);
      throw new BaseHttpError('Servers retrieval error', 500);
    }
  };
}

module.exports = FileService;
