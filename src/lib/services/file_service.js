const fs = require('fs-extra');
const path = require('path');
const config = require('config');
const BaseHttpError = require('../../errors/base_http_error.js');
const FileModel = require('../../models/file_model.js');
const GoogleUploadService = require('./google_upload_service.js');

function FileService(logger, postgrePool) {
  let _logger = logger;
  let _google = new GoogleUploadService(logger);
  let _fileModel = new FileModel(logger, postgrePool);

  async function getFileSize(fileName) {
    let fileStats = await fs.stat(fileName);
    return fileStats.size;
  }

  async function createRemoteFile(localFilepath) {
    let filepath = localFilepath;
    if (path.isAbsolute(localFilepath)) {
      filepath = path.relative('.', localFilepath);
    }
    let uploadedFile;
    try {
      uploadedFile = await _google.uploadFromLocal(filepath);
    } catch (err) {
      _logger.error('An error occurred while uploading the file: %s', filepath);
      throw err;
    }
    uploadedFile.size = await getFileSize(filepath);
    return uploadedFile;
  };

  this.loadFileAndUpload = async (filePath, serverOwner) => {
    try {
      let uploadedFile = await createRemoteFile(filePath);
      uploadedFile.owner = serverOwner;
      let savedFile = await _fileModel.create(uploadedFile);
      return savedFile;
    } catch (err) {
      _logger.error('Error during file creation: %s', err);
      throw new BaseHttpError('File creation error', 500);
    }
  };

  async function getServerDirectory(serverOwnerId) {
    let filesDirectory = config.FILES_DIRECTORY;
    let serverFilesDirectory = path.join(filesDirectory, serverOwnerId);
    await fs.ensureDir(serverFilesDirectory);
    return serverFilesDirectory;
  }

  async function updateLocalFile(oldFilename, newFilename, serverOwnerId) {
    let serverFilesDirectory = await getServerDirectory(serverOwnerId);
    let oldFilePath = path.join(serverFilesDirectory, oldFilename);
    let newFilePath = path.join(serverFilesDirectory, newFilename);
    await fs.rename(oldFilePath, newFilePath);
  }

  this.updateFile = async (fileData) => {
    let fileToUpdate = await _fileModel.findByFileId(fileData.id);
    if (fileToUpdate) {
      if (fileToUpdate.filename !== fileData.filename) {
        await updateLocalFile(fileToUpdate.filename, fileData.filename, fileData.owner.toString());
        let remoteFile;
        try {
          remoteFile = await _google.updateRemoteFilename(fileToUpdate.filename, fileData.filename, fileData.owner.toString());
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

  async function deleteLocalFile(filename, serverOwnerId) {
    let serverFilesDirectory = await getServerDirectory(serverOwnerId);
    let filePathToDelete = path.join(serverFilesDirectory, filename);
    await fs.remove(filePathToDelete);
  }

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
      await _google.deleteRemoteFile(deletedFile.filename, deletedFile.owner.toString());
    } catch (err) {
      throw new BaseHttpError('Remote file delete error', 500);
    }
    return await deleteLocalFile(deletedFile.filename, deletedFile.owner.toString());
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
