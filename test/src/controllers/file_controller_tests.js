const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const FileControllerModule = '../../../src/controllers/file_controller.js';

let mockFileService = {
  createFile: sinon.stub(),
};

let mockLogger = {
  error: sinon.stub(),
};

function setupFileController() {
  let mocks = {
    '../lib/services/file_service.js': function() {
      return mockFileService;
    },
  };
  let FileController = proxyquire(FileControllerModule, mocks);
  return new FileController(mockLogger);
}

describe('FileController Tests', () => {
  let fileController;

  before(() => {
    fileController = setupFileController();
  });

  beforeEach(() => {
    mockFileService.createFile.resetHistory();
  });

  describe('#createFile', () => {
    function getMockFileRequest() {
      let encodedFile = Buffer.from('fileContent').toString('base64');
      return {
        body: {
          metadata: {
            name: 'fileName',
          },
          file: encodedFile,
        },
      };
    }

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockFileService.createFile.resolves({ file_id: 123, file_name: 'name', _rev: 'rev', size: 1234,
                                              updated_time: '2018-04-09', created_time: '2018-04-09', resource: 'remoteFileUri' });
      });

      it('calls file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.createFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.createFile.calledOnce);
      });

      it('passes correct params to file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.createFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.createFile.getCall(0).args[0]).to.be.eql(mockFileRequest.body);
      });

      it('saves file in response', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.createFile(mockFileRequest, mockResponse, function() {});
        expect(mockResponse.file).to.be.ok();
        expect(mockResponse.file.file_id).to.be(123);
        expect(mockResponse.file.file_name).to.be('name');
        expect(mockResponse.file._rev).to.be('rev');
        expect(mockResponse.file.size).to.be(1234);
        expect(mockResponse.file.resource).to.be('remoteFileUri');
        expect(mockResponse.file.updated_time).to.be('2018-04-09');
        expect(mockResponse.file.created_time).to.be('2018-04-09');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        let mockFileRequest = getMockFileRequest();
        await fileController.createFile(mockFileRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockFileService.createFile.rejects(new Error('creation error'));
      });

      it('calls file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.createFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.createFile.calledOnce);
      });

      it('passes correct params to file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.createFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.createFile.getCall(0).args[0]).to.be.eql(mockFileRequest.body);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        let mockFileRequest = getMockFileRequest();
        await fileController.createFile(mockFileRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('creation error')));
      });
    });
  });
});
