const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const BaseHttpError = require('../../../../src/errors/base_http_error.js');
const FileServiceModule = '../../../../src/lib/services/file_service.js';

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
};

const mockFileModel = {
  create: sinon.stub(),
  update: sinon.stub(),
  findByFileId: sinon.stub(),
};

const mockFs = {
  existsSync: sinon.stub(),
  writeFile: sinon.stub(),
  stat: sinon.stub(),
};

const mockGoogleUploadService = {
  uploadFromLocal: sinon.stub(),
};

function setupFileService() {
  let mocks = {
    '../../models/file_model.js': function() {
      return mockFileModel;
    },
    'fs': mockFs,
    './google_upload_service.js': function() {
      return mockGoogleUploadService;
    },
  };
  let FileService = proxyquire(FileServiceModule, mocks);
  return new FileService(mockLogger);
}

describe('FileService Tests', () => {
  let fileService;

  before(() => {
    fileService = setupFileService();
  });

  describe('#createFile', () => {
    function getMockFileData() {
      let encodedFile = Buffer.from('fileContent').toString('base64');
      return {
        name: 'fileName',
        encodedFile: encodedFile,
      };
    }

    describe('create success', () => {
      before(() => {
        mockFs.existsSync.returns(true);
        mockFs.writeFile.callsArgWith(2, null);
        mockFs.stat.callsArgWith(1, null, { size: 1234 });
        mockGoogleUploadService.uploadFromLocal.resolves({ resource: 'remoteFileUri', file_name: 'fileNameOnGoogleStorage' });
        mockFileModel.create.resolves({ id: 1, filename: 'name', _rev: 'rev', updatedTime: '2018-04-09',
                                        createdTime: '2018-04-09', resource: 'remoteFileUri', size: 1234 });
      });

      it('returns file', async () => {
        let mockFileBody = getMockFileData();
        let file = await fileService.createFileAndUpload(mockFileBody);
        expect(file).to.be.ok();
        expect(file.id).to.be(1);
        expect(file.filename).to.be('name');
        expect(file._rev).to.be('rev');
        expect(file.size).to.be(1234);
        expect(file.resource).to.be('remoteFileUri');
        expect(file.updatedTime).to.be('2018-04-09');
        expect(file.createdTime).to.be('2018-04-09');
      });
    });


    describe('db create failure', () => {
      before(() => {
        mockFs.existsSync.returns(true);
        mockFs.writeFile.callsArgWith(2, null);
        mockFs.stat.callsArgWith(1, null, { size: 1234 });
        mockGoogleUploadService.uploadFromLocal.resolves({ resource: 'remoteFileUri', file_name: 'fileNameOnGoogleStorage' });
        mockFileModel.create.rejects(new Error('File creation error'));
      });

      it('throws error', async () => {
        let mockFileBody = getMockFileData();
        let error;
        try {
          await fileService.createFileAndUpload(mockFileBody);
        } catch (ex) {
          error = ex;
        }
        expect(error).to.be.ok();
        expect(error).to.be.a(BaseHttpError);
        expect(error.statusCode).to.be(500);
        expect(error.message).to.be('File creation error');
      });
    });

    describe('google upload failure', () => {
      before(() => {
        mockFs.writeFile.callsArgWith(2, null);
        mockFs.stat.callsArgWith(1, null, { size: 1234 });
        mockGoogleUploadService.uploadFromLocal.rejects(new Error('Google upload failure'));
      });

      it('throws error', async () => {
        let mockFileBody = getMockFileData();
        let error;
        try {
          await fileService.createFileAndUpload(mockFileBody);
        } catch (ex) {
          error = ex;
        }
        expect(error).to.be.ok();
        expect(error).to.be.a(BaseHttpError);
        expect(error.statusCode).to.be(500);
        expect(error.message).to.be('File creation error');
      });
    });
  });

  describe('#updateFile', () => {
    function getMockFileData() {
      return {
        id: 1,
        _rev: 'rev',
        filename: 'newFileName',
        resource: 'newRemoteFileUri',
        size: 789,
      };
    }

    describe('update success', () => {
      before(() => {
        mockFileModel.update.resolves({ id: 1, filename: 'newFileName', _rev: 'newRev', updatedTime: '2018-04-09',
          createdTime: '2018-04-09', resource: 'newRemoteFileUri', size: 789 });
      });

      it('returns file', async () => {
        let mockFileBody = getMockFileData();
        let file = await fileService.updateFile(mockFileBody);
        expect(file).to.be.ok();
        expect(file.id).to.be(1);
        expect(file.filename).to.be('newFileName');
        expect(file._rev).to.be('newRev');
        expect(file.size).to.be(789);
        expect(file.resource).to.be('newRemoteFileUri');
        expect(file.updatedTime).to.be('2018-04-09');
        expect(file.createdTime).to.be('2018-04-09');
      });
    });


    describe('update failure', () => {
      before(() => {
        mockFileModel.update.rejects(new Error('File update error'));
      });

      it('throws 500 error', async () => {
        let mockFileBody = getMockFileData();
        let error;
        try {
          await fileService.updateFile(mockFileBody);
        } catch (ex) {
          error = ex;
        }
        expect(error).to.be.ok();
        expect(error).to.be.a(BaseHttpError);
        expect(error.statusCode).to.be(500);
        expect(error.message).to.be('File update error');
      });
    });

    describe('integrity check failure', () => {
      before(() => {
        mockFileModel.update.rejects(new Error('Integrity check error'));
      });

      it('throws 409 error', async () => {
        let mockFileBody = getMockFileData();
        let error;
        try {
          await fileService.updateFile(mockFileBody);
        } catch (ex) {
          error = ex;
        }
        expect(error).to.be.a(BaseHttpError);
        expect(error.statusCode).to.be(409);
        expect(error.message).to.be('Integrity check error');
      });
    });

    describe('file not found', () => {
      before(() => {
        mockFileModel.update.rejects(new Error('File does not exist'));
      });

      it('throws 404 error', async () => {
        let mockFileBody = getMockFileData();
        let error;
        try {
          await fileService.updateFile(mockFileBody);
        } catch (ex) {
          error = ex;
        }
        expect(error).to.be.a(BaseHttpError);
        expect(error.statusCode).to.be(404);
        expect(error.message).to.be('File does not exist');
      });
    });
  });

  describe('#findFile', () => {
    let mockBody = {
      id: 1,
    };

    describe('file found', () => {
      before(() => {
        mockFileModel.findByFileId.resolves({ id: 1, filename: 'name', _rev: 'rev', size: 789,
                                              resource: 'remoteFileUri', updatedTime: '2018-04-09', createdTime: '2018-04-09' });
      });

      it('returns file', async () => {
        let file = await fileService.findFile(mockBody);
        expect(file).to.be.ok();
        expect(file.id).to.be(1);
        expect(file.filename).to.be('name');
        expect(file._rev).to.be('rev');
        expect(file.size).to.be(789);
        expect(file.resource).to.be('remoteFileUri');
        expect(file.updatedTime).to.be('2018-04-09');
        expect(file.createdTime).to.be('2018-04-09');
      });
    });

    describe('file not found', () => {
      before(() => {
        mockFileModel.findByFileId.resolves();
      });

      it('throws 404 error', async () => {
        let err;
        try {
          await fileService.findFile(mockBody);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.a(BaseHttpError);
        expect(err.statusCode).to.be(404);
        expect(err.message).to.be('File does not exist');
      });
    });

    describe('find failure', () => {
      before(() => {
        mockFileModel.findByFileId.rejects(new Error('Find error'));
      });

      it('throws 500 error', async () => {
        let err;
        try {
          await fileService.findFile(mockBody);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.a(BaseHttpError);
        expect(err.statusCode).to.be(500);
        expect(err.message).to.be('File find error');
      });
    });
  });
});
