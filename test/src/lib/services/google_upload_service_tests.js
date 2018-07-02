const expect = require('expect.js');
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const GoogleUploadServiceModule = '../../../../src/lib/services/google_upload_service.js';

let mockLogger = {
  error: sinon.stub(),
  info: sinon.stub(),
};

let mockGoogleStorage = {
  bucket: sinon.stub(),
};

let mockGoogleBucket = {
  upload: sinon.stub(),
};

let mockGoogleStorageConstructor = sinon.stub();

function setupGoogleUploadService() {
  let mocks = {
    '@google-cloud/storage': mockGoogleStorageConstructor,
  };
  let GoogleUploadService = proxyquire(GoogleUploadServiceModule, mocks);
  return new GoogleUploadService(mockLogger);
}

describe('GoogleUploadService Tests', () => {
  let mockFilePath = path.join('local', 'path', 'to', 'file.txt');

  beforeEach(() => {
    this.clock = sinon.useFakeTimers();

    mockGoogleStorageConstructor.resetHistory();
    mockGoogleStorageConstructor.resetBehavior();

    mockGoogleStorage.bucket.resetHistory();
    mockGoogleStorage.bucket.resetBehavior();

    mockGoogleBucket.upload.resetHistory();
    mockGoogleBucket.upload.resetBehavior();

    mockGoogleStorageConstructor.returns(mockGoogleStorage);
    mockGoogleStorage.bucket.returns(mockGoogleBucket);
  });

  afterEach(() => {
    this.clock.restore();
  });

  describe('#uploadFromLocal', () => {
    describe('upload success', () => {
      beforeEach(() => {
        mockGoogleBucket.upload.resolves();
      });

      it('calls google storage constructor', async () => {
        let googleUploadService = setupGoogleUploadService();
        await googleUploadService.uploadFromLocal(mockFilePath);
        expect(mockGoogleStorageConstructor.calledOnce);
      });

      it('passes correct google storage config', async () => {
        let googleUploadService = setupGoogleUploadService();
        await googleUploadService.uploadFromLocal(mockFilePath);
        expect(mockGoogleStorageConstructor.getCall(0).args[0]).to.be.eql({ projectId: 'taller2-2018-1-grupo2', keyFilename: 'google-cloud-key.json' });
      });

      it('calls google storage for bucket', async () => {
        let googleUploadService = setupGoogleUploadService();
        await googleUploadService.uploadFromLocal(mockFilePath);
        expect(mockGoogleStorage.bucket.calledOnce);
      });

      it('passes correct google bucket name', async () => {
        let googleUploadService = setupGoogleUploadService();
        await googleUploadService.uploadFromLocal(mockFilePath);
        expect(mockGoogleStorage.bucket.getCall(0).args[0]).to.be('staging.taller2-2018-1-grupo2.appspot.com');
      });

      it('calls google bucket for upload', async () => {
        let googleUploadService = setupGoogleUploadService();
        await googleUploadService.uploadFromLocal(mockFilePath);
        expect(mockGoogleBucket.upload.calledOnce);
      });

      it('passes correct params for upload', async () => {
        let googleUploadService = setupGoogleUploadService();
        await googleUploadService.uploadFromLocal(mockFilePath);
        expect(mockGoogleBucket.upload.getCall(0).args[0]).to.be(mockFilePath);
        expect(mockGoogleBucket.upload.getCall(0).args[1]).to.be.eql({ public: true, destination: 'path/to/file.txt' });
      });

      it('does not throw error', async () => {
        let googleUploadService = setupGoogleUploadService();
        let error;
        try {
          await googleUploadService.uploadFromLocal(mockFilePath);
        } catch (ex) {
          error = ex;
        }
        expect(error).to.be.null;
      });

      it('returns uploaded file', async () => {
        let googleUploadService = setupGoogleUploadService();
        let uploadedFile = await googleUploadService.uploadFromLocal(mockFilePath);
        expect(uploadedFile.file_name).to.be('file.txt');
        expect(uploadedFile.resource).to.be('https://storage.googleapis.com/staging.taller2-2018-1-grupo2.appspot.com/path/to/file.txt');
      });
    });

    describe('upload failure', () => {
      beforeEach(() => {
        mockGoogleBucket.upload.rejects();
      });

      it('calls google storage constructor', async () => {
        let googleUploadService = setupGoogleUploadService();
        try {
          await googleUploadService.uploadFromLocal(mockFilePath);
        } catch (err) {}
        expect(mockGoogleStorageConstructor.calledOnce);
      });

      it('passes correct google storage config', async () => {
        let googleUploadService = setupGoogleUploadService();
        try {
          await googleUploadService.uploadFromLocal(mockFilePath);
        } catch (err) {}
        expect(mockGoogleStorageConstructor.getCall(0).args[0]).to.be.eql({ projectId: 'taller2-2018-1-grupo2', keyFilename: 'google-cloud-key.json' });
      });

      it('calls google storage for bucket', async () => {
        let googleUploadService = setupGoogleUploadService();
        try {
          await googleUploadService.uploadFromLocal(mockFilePath);
        } catch (err) {}
        expect(mockGoogleStorage.bucket.calledOnce);
      });

      it('passes correct google bucket name', async () => {
        let googleUploadService = setupGoogleUploadService();
        try {
          await googleUploadService.uploadFromLocal(mockFilePath);
        } catch (err) {}
        expect(mockGoogleStorage.bucket.getCall(0).args[0]).to.be('staging.taller2-2018-1-grupo2.appspot.com');
      });

      it('calls google bucket for upload', async () => {
        let googleUploadService = setupGoogleUploadService();
        try {
          await googleUploadService.uploadFromLocal(mockFilePath);
        } catch (err) {}
        expect(mockGoogleBucket.upload.calledOnce);
      });

      it('passes correct params for upload', async () => {
        let googleUploadService = setupGoogleUploadService();
        try {
          await googleUploadService.uploadFromLocal(mockFilePath);
        } catch (err) {}
        expect(mockGoogleBucket.upload.getCall(0).args[0]).to.be(mockFilePath);
        expect(mockGoogleBucket.upload.getCall(0).args[1]).to.be.eql({ public: true, destination: 'path/to/file.txt' });
      });

      it('throws error', async () => {
        let googleUploadService = setupGoogleUploadService();
        let error;
        try {
          await googleUploadService.uploadFromLocal(mockFilePath);
        } catch (ex) {
          error = ex;
        }
        expect(error).to.be.ok();
      });
    });
  });
});
