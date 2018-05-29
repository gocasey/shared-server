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
    function getMockFileBody() {
      let encodedFile = Buffer.from('fileContent').toString('base64');
      return {
        metadata: {
          name: 'fileName',
        },
        file: encodedFile,
      };
    }

    describe('create success', () => {
      before(() => {
        mockFs.existsSync.returns(true);
        mockFs.writeFile.callsArgWith(2, null);
        mockFs.stat.callsArgWith(1, null, { size: 1234 });
        mockGoogleUploadService.uploadFromLocal.resolves({ resource: 'remoteFileUri', file_name: 'fileNameOnGoogleStorage' });
        mockFileModel.create.resolves({ file_id: 1, file_name: 'name', _rev: 'rev', updated_time: '2018-04-09',
                                        created_time: '2018-04-09', resource: 'remoteFileUri', size: 1234 });
      });

      it('returns file', async () => {
        let mockFileBody = getMockFileBody();
        let file = await fileService.createFile(mockFileBody);
        expect(file).to.be.ok();
        expect(file.file_id).to.be(1);
        expect(file.file_name).to.be('name');
        expect(file._rev).to.be('rev');
        expect(file.size).to.be(1234);
        expect(file.resource).to.be('remoteFileUri');
        expect(file.updated_time).to.be('2018-04-09');
        expect(file.created_time).to.be('2018-04-09');
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
        let mockFileBody = getMockFileBody();
        let error;
        try {
          await fileService.createFile(mockFileBody);
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
        let mockFileBody = getMockFileBody();
        let error;
        try {
          await fileService.createFile(mockFileBody);
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
});
