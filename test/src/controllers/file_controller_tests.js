const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const FileControllerModule = '../../../src/controllers/file_controller.js';

let mockFileService = {
  createFileAndUpload: sinon.stub(),
  updateFile: sinon.stub(),
  findFile: sinon.stub(),
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
    mockFileService.createFileAndUpload.resetHistory();
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
        mockFileService.createFileAndUpload.resolves({ id: 123, filename: 'name', _rev: 'rev', size: 1234,
                                              updatedTime: '2018-04-09', createdTime: '2018-04-09', resource: 'remoteFileUri' });
      });

      it('calls file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.createFileFromJson(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.createFileAndUpload.calledOnce);
      });

      it('passes correct params to file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.createFileFromJson(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.createFileAndUpload.getCall(0).args[0]).to.be.eql({ name: 'fileName',
                                                                          encodedFile: mockFileRequest.body.file });
      });

      it('saves file in response', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.createFileFromJson(mockFileRequest, mockResponse, function() {});
        expect(mockResponse.file).to.be.ok();
        expect(mockResponse.file.id).to.be(123);
        expect(mockResponse.file.filename).to.be('name');
        expect(mockResponse.file._rev).to.be('rev');
        expect(mockResponse.file.size).to.be(1234);
        expect(mockResponse.file.resource).to.be('remoteFileUri');
        expect(mockResponse.file.updatedTime).to.be('2018-04-09');
        expect(mockResponse.file.createdTime).to.be('2018-04-09');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        let mockFileRequest = getMockFileRequest();
        await fileController.createFileFromJson(mockFileRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockFileService.createFileAndUpload.rejects(new Error('creation error'));
      });

      it('calls file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.createFileFromJson(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.createFileAndUpload.calledOnce);
      });

      it('passes correct params to file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.createFileFromJson(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.createFileAndUpload.getCall(0).args[0]).to.be.eql({ name: 'fileName',
                                                                          encodedFile: mockFileRequest.body.file });
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        let mockFileRequest = getMockFileRequest();
        await fileController.createFileFromJson(mockFileRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('creation error')));
      });
    });
  });

  describe('#updateFile', () => {
    function getMockFileRequest() {
      return {
        params: {
          fileId: 123,
        },
        body: {
          _rev: 'rev',
          filename: 'newName',
          size: 5678,
          resource: 'newRemoteFileUri',
        },
      };
    }

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockFileService.updateFile.resolves({ id: 123, filename: 'newName', _rev: 'rev', size: 5678,
          updatedTime: '2018-04-09', createdTime: '2018-04-09', resource: 'newRemoteFileUri' });
      });

      it('calls file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.updateFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.updateFile.calledOnce);
      });

      it('passes correct params to file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.updateFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.updateFile.getCall(0).args[0]).to.be.eql({ id: 123, filename: 'newName', _rev: 'rev',
                                                                          size: 5678, resource: 'newRemoteFileUri' });
      });

      it('saves file in response', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.updateFile(mockFileRequest, mockResponse, function() {});
        expect(mockResponse.file).to.be.ok();
        expect(mockResponse.file.id).to.be(123);
        expect(mockResponse.file.filename).to.be('newName');
        expect(mockResponse.file._rev).to.be('rev');
        expect(mockResponse.file.size).to.be(5678);
        expect(mockResponse.file.resource).to.be('newRemoteFileUri');
        expect(mockResponse.file.updatedTime).to.be('2018-04-09');
        expect(mockResponse.file.createdTime).to.be('2018-04-09');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        let mockFileRequest = getMockFileRequest();
        await fileController.updateFile(mockFileRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockFileService.updateFile.rejects(new Error('update error'));
      });

      it('calls file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.updateFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.updateFile.calledOnce);
      });

      it('passes correct params to file service', async () => {
        let mockFileRequest = getMockFileRequest();
        await fileController.updateFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.updateFile.getCall(0).args[0]).to.be.eql({ id: 123, filename: 'newName', _rev: 'rev',
                                                                          size: 5678, resource: 'newRemoteFileUri' });
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        let mockFileRequest = getMockFileRequest();
        await fileController.updateFile(mockFileRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('update error')));
      });
    });
  });

  describe('#findFile', () => {
    let mockFileRequest = {
      params: {
        fileId: 123,
      },
    };

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockFileService.findFile.resolves({ id: 123, filename: 'name', _rev: 'rev', size: 789,
                                            resource: 'remoteFileUri', updatedTime: '2018-04-09', createdTime: '2018-04-09' });
      });

      it('calls file service', async () => {
        await fileController.findFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.findFile.calledOnce);
      });

      it('passes correct params to file service', async () => {
        await fileController.findFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.findFile.getCall(0).args[0]).to.be.eql(123);
      });

      it('saves file in response', async () => {
        await fileController.findFile(mockFileRequest, mockResponse, function() {});
        expect(mockResponse.file).to.be.ok();
        expect(mockResponse.file.id).to.be(123);
        expect(mockResponse.file.filename).to.be('name');
        expect(mockResponse.file._rev).to.be('rev');
        expect(mockResponse.file.size).to.be(789);
        expect(mockResponse.file.resource).to.be('remoteFileUri');
        expect(mockResponse.file.updatedTime).to.be('2018-04-09');
        expect(mockResponse.file.createdTime).to.be('2018-04-09');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await fileController.findFile(mockFileRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockFileService.findFile.rejects(new Error('find error'));
      });

      it('calls file service', async () => {
        await fileController.findFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.findFile.calledOnce);
      });

      it('passes correct params to file service', async () => {
        await fileController.findFile(mockFileRequest, mockResponse, function() {});
        expect(mockFileService.findFile.getCall(0).args[0]).to.be.eql(123);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await fileController.findFile(mockFileRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('find error')));
      });
    });
  });
});
