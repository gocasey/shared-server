const config = require('config');
const path = require('path');
const Storage = require('@google-cloud/storage');

const projectId = config.GOOGLE_CLOUD_PROJECT_ID;
const bucketName = config.GOOGLE_CLOUD_BUCKET_NAME;

const storage = new Storage({
  projectId: projectId,
  keyFilename: 'google-cloud-key.json',
});

function GoogleUploadService(logger) {
  let _logger = logger;

  function getPublicUrl(filePath) {
    return `https://storage.googleapis.com/${bucketName}/${filePath}`;
  }

  function getFileModel(filePath) {
    let fileModel = {};
    fileModel.resource = encodeURI(getPublicUrl(filePath));
    fileModel.file_name = path.basename(filePath);
    return fileModel;
  }

  function getStorageOptions(gcsFilename) {
    return {
      public: true,
      destination: gcsFilename,
    };
  }

  this.uploadFromLocal = async (localFilepath) => {
    let bucket = storage.bucket(bucketName);
    let filename = localFilepath.substring(localFilepath.indexOf(path.sep) + 1); // remove root folder from path
    let storageOptions = getStorageOptions(filename);
    try {
      await bucket.upload(localFilepath, storageOptions);
    } catch (err) {
      _logger.error('Error uploading file with key: \'%s\' to bucket: \'%s\'', filename, bucketName);
      throw err;
    }
    _logger.info('File with key: \'%s\' was uploaded successfully to bucket: \'%s\'', filename, bucketName);
    return getFileModel(filename);
  };

  this.updateRemoteFilename = async (oldFilename, newFilename, serverOwner) => {
    let oldFilepath = path.join(serverOwner, oldFilename);
    let newFilepath = path.join(serverOwner, newFilename);
    let bucket = storage.bucket(bucketName);
    try {
      let file = await bucket.file(oldFilepath);
      await file.move(newFilepath);
    } catch (err) {
      _logger.error('Error renaming file with key: \'%s\' to new key :\'%s\' in bucket: \'%s\'', oldFilename, newFilename, bucketName);
      _logger.debug('Remote file update error: %j', err);
      throw err;
    }
    _logger.info('File with key: \'%s\' was successfully renamed to: \'%s\' in bucket: \'%s\'', oldFilename, newFilename, bucketName);
    return getFileModel(newFilepath);
  };

  this.deleteRemoteFile = async (filename, serverOwner) => {
    let filepath = path.join(serverOwner, filename);
    let bucket = storage.bucket(bucketName);
    try {
      let file = await bucket.file(filepath);
      await file.delete();
    } catch (err) {
      _logger.error('Error deleting file with key: \'%s\' in bucket: \'%s\'', filepath, bucketName);
      throw err;
    }
    _logger.info('File with key: \'%s\' was deleted successfully in bucket: \'%s\'', filepath, bucketName);
    return;
  };

  this.deleteBucketContent = async () => {
    let bucket = storage.bucket(bucketName);
    try {
      let results = await bucket.getFiles();
      let files = results[0];
      await Promise.all(files.map(async (file) => {
        await file.delete();
        _logger.info('File with key: \'%s\' was deleted successfully in bucket: \'%s\'', file.name, bucketName);
      }));
    } catch (err) {
      _logger.error('Error deleting file with key: \'%s\' in bucket: \'%s\'', file.name, bucketName);
      throw err;
    }
    return;
  };
}

module.exports = GoogleUploadService;
