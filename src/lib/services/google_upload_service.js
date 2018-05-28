const path = require('path');
const Storage = require('@google-cloud/storage');

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;

const storage = new Storage({
  projectId: projectId,
  keyFilename: 'google-cloud-key.json',
});

function GoogleUploadService(logger) {
  let _logger = logger;

  function getPublicUrl(filename) {
    return `https://storage.googleapis.com/${bucketName}/${filename}`;
  }

  function getFileModel(gcsFilename) {
    let fileModel = {};
    fileModel.resource = encodeURI(getPublicUrl(gcsFilename));
    fileModel.file_name = gcsFilename;
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
    let filename = path.basename(localFilepath);
    let gcsFilename = Date.now() + filename;
    let storageOptions = getStorageOptions(gcsFilename);
    try {
      await bucket.upload(localFilepath, storageOptions);
    } catch (err) {
      _logger.error('Error uploading file with name: \'%s\' to bucket: \'%s\'', gcsFilename, bucketName);
      throw err;
    }
    _logger.info('File with name: \'%s\' was uploaded successfully to bucket: \'%s\'', gcsFilename, bucketName);
    return getFileModel(gcsFilename);
  };
}

module.exports = GoogleUploadService;
