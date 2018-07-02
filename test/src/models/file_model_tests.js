const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const FileModelModule = '../../../src/models/file_model.js';

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
  warn: sinon.stub(),
  debug: sinon.stub(),
};

const mockClient = {
  query: sinon.stub(),
  release: sinon.stub(),
};

const mockPool = {
  connect: () => {
    return mockClient;
    },
};

const mockIntegrityValidator = {
  createHash: sinon.stub(),
};

function createFileModel() {
  mockClient.release.returns();
  mockIntegrityValidator.createHash.returns('newRev');
  let mocks = { '../../src/utils/integrity_validator.js': function() {
      return mockIntegrityValidator;
    } };
  let FileModel = proxyquire(FileModelModule, mocks);
  return new FileModel(mockLogger, mockPool);
}

const fileModel = createFileModel();

describe('FileModel Tests', () => {
  beforeEach(() => {
    mockLogger.info.resetHistory();
    mockLogger.error.resetHistory();
    mockLogger.warn.resetHistory();
    mockLogger.debug.resetHistory();
    mockClient.query.resetHistory();
  });

  describe('#findByFileId', () => {
    let idToLookFor = 123;

    let dbFileFound = {
      file_id: 123,
      file_name: 'name',
      _rev: 'rev',
      size: 7890,
      resource: 'remoteFileUri',
      updated_time: '2018-04-09',
      created_time: '2018-04-09',
    };

    describe('file found', () => {
      before(() => {
        mockClient.query.resolves({ rows: [dbFileFound] });
      });

      it('returns file', async () => {
        let file = await fileModel.findByFileId(idToLookFor);
        expect(file).to.be.ok();
        expect(file.id).to.be(123);
        expect(file.filename).to.be('name');
        expect(file._rev).to.be('rev');
        expect(file.size).to.be(7890);
        expect(file.resource).to.be('remoteFileUri');
        expect(file.updatedTime).to.be('2018-04-09');
        expect(file.createdTime).to.be('2018-04-09');
      });

      it('logs success', async () => {
        await fileModel.findByFileId(idToLookFor);
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('File with id:\'%s\' found');
        expect(mockLogger.info.getCall(0).args[1]).to.be(123);
      });
    });

    describe('file not found', () => {
      before(() => {
        mockClient.query.resolves({ rows: [] });
      });

      it('returns null', async () => {
        let file = await fileModel.findByFileId(idToLookFor);
        expect(file).to.be.null;
      });

      it('logs file not found', async () => {
        await fileModel.findByFileId(idToLookFor);
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('File with id:\'%s\' not found');
        expect(mockLogger.info.getCall(0).args[1]).to.be(123);
      });
    });

    describe('db error', () => {
      before(() => {
        mockClient.query.rejects(new Error('DB error'));
      });

      it('returns error', async () => {
        let err;
        try {
          await fileModel.findByFileId(idToLookFor);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('DB error');
      });

      it('logs db failure', async () => {
        try {
          await fileModel.findByFileId(idToLookFor);
        } catch (err) { }
        expect(mockLogger.error.calledTwice);
        expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
        expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
        expect(mockLogger.error.getCall(1).args[0]).to.be('Error looking for file id:\'%s\' in the database');
        expect(mockLogger.error.getCall(1).args[1]).to.be(123);
      });
    });
  });

  describe('#update', () => {
    let mockFile = {
      id: 123,
      filename: 'name',
      _rev: 'oldRev',
      size: 1234,
      resource: 'newRemoteFileUri',
      owner: 'serverId',
    };

    let dbFileFound = {
      file_id: 123,
      file_name: 'name',
      _rev: 'oldRev',
      size: 7890,
      resource: 'oldRemoteFileUri',
      owner: 'serverId',
    };

    let dbFileFoundModified = {
      file_id: 123,
      file_name: 'name',
      _rev: 'anotherRev',
      size: 3456,
      resource: 'anotherRemoteFileUri',
      owner: 'serverId',
    };

    let dbFileUpdated = {
      file_id: 123,
      file_name: 'name',
      _rev: 'newRev',
      size: 1234,
      resource: 'newRemoteFileUri',
      owner: 'serverId',
    };

    describe('file found', () => {
      describe('file not modified', () => {
        before(() => {
          mockClient.query.onFirstCall().resolves({ rows: [dbFileFound] });
        });

        describe('update success', () => {
          before(() => {
            mockClient.query.onSecondCall().resolves({ rows: [dbFileUpdated] });
          });

          it('passes correct values to find query', async () => {
            await fileModel.update(mockFile);
            expect(mockClient.query.getCall(0).args[1]).to.eql([123]);
          });

          it('passes correct values to update query', async () => {
            await fileModel.update(mockFile);
            expect(mockClient.query.calledTwice);
            expect(mockClient.query.getCall(1).args[1]).to.eql(['newRev', 'name', 1234, 'newRemoteFileUri', 'serverId', 123]);
          });

          it('returns updated file', async () => {
            let file = await fileModel.update(mockFile);
            expect(file.id).to.be(123);
            expect(file.filename).to.be('name');
            expect(file._rev).to.be('newRev');
          });
        });

        describe('db error on update', () => {
          before(() => {
            mockClient.query.onSecondCall().rejects(new Error('DB error on update'));
          });

          it('passes correct values to update query', async () => {
            try {
              await fileModel.update(mockFile);
            } catch (err) {}
            expect(mockClient.query.calledTwice);
            expect(mockClient.query.getCall(1).args[1]).to.eql(['newRev', 'name', 1234, 'newRemoteFileUri', 'serverId', 123]);
          });

          it('returns error', async () => {
            let err;
            try {
              await fileModel.update(mockFile);
            } catch (ex) {
              err = ex;
            }
            expect(err).to.be.ok();
            expect(err.message).to.be('DB error on update');
          });
        });
      });

      describe('file modified', () => {
        before(() => {
          mockClient.query.onFirstCall().resolves({ rows: [dbFileFoundModified] });
        });

        it('passes correct values to find query', async () => {
          try {
            await fileModel.update(mockFile);
          } catch (err) { }
          expect(mockClient.query.calledOnce);
          expect(mockClient.query.getCall(0).args[1]).to.eql([123]);
        });

        it('returns error', async () => {
          let err;
          try {
            await fileModel.update(mockFile);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('Error updating');
        });
      });
    });

    describe('file not found', () => {
      before(() => {
        mockClient.query.onFirstCall().resolves({ rows: [] });
      });

      it('passes correct values to find query', async () => {
        try {
          await fileModel.update(mockFile);
        } catch (err) {}
        expect(mockClient.query.calledOnce);
        expect(mockClient.query.getCall(0).args[1]).to.eql([123]);
      });

      it('returns error', async () => {
        let err;
        try {
          await fileModel.update(mockFile);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('File does not exist');
      });
    });

    describe('db failure on find', () => {
      before(() => {
        mockClient.query.onFirstCall().rejects(new Error('db failure on find'));
      });

      it('passes correct values to find query', async () => {
        try {
          await fileModel.update(mockFile);
        } catch (err) {}
        expect(mockClient.query.calledOnce);
        expect(mockClient.query.getCall(0).args[1]).to.eql([123]);
      });

      it('returns error', async () => {
        let err;
        try {
          await fileModel.update(mockFile);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('db failure on find');
      });
    });
  });

  describe('#create', () => {
    let mockFile = {
      file_name: 'name',
      size: 7890,
      resource: 'remoteFileUri',
      owner: 456,
    };

    let mockDbFile = {
      file_name: 'name',
      file_id: 123,
      size: 7890,
      resource: 'remoteFileUri',
      updated_time: '2018-04-09',
      created_time: '2018-04-09',
      owner: 456,
    };

    let mockDbFileUpdated = {
      file_name: 'name',
      file_id: 123,
      _rev: 'newRev',
      size: 7890,
      resource: 'remoteFileUri',
      updated_time: '2018-04-09',
      created_time: '2018-04-09',
      owner: 456,
    };

    describe('insert success', () => {
      before(() => {
        mockClient.query.onFirstCall().resolves({ rows: [mockDbFile] });
      });

      describe('update success', () => {
        before(() => {
          mockClient.query.onSecondCall().resolves({ rows: [mockDbFileUpdated] });
        });

        it('passes correct values to insert query', async () => {
          await fileModel.create(mockFile);
          expect(mockClient.query.getCall(0).args[1]).to.eql(['name', 'remoteFileUri', 7890, 456]);
        });

        it('passes correct values to update query', async () => {
          await fileModel.create(mockFile);
          expect(mockClient.query.calledTwice);
          expect(mockClient.query.getCall(1).args[1]).to.eql(['newRev', 123]);
        });

        it('returns updated file', async () => {
          let file = await fileModel.create(mockFile);
          expect(file.id).to.be(123);
          expect(file.filename).to.be('name');
          expect(file._rev).to.be('newRev');
          expect(file.size).to.be(7890);
          expect(file.resource).to.be('remoteFileUri');
          expect(file.updatedTime).to.be('2018-04-09');
          expect(file.createdTime).to.be('2018-04-09');
        });
      });

      describe('db error on update', () => {
        before(() => {
          mockClient.query.onSecondCall().rejects(new Error('DB error'));
        });

        it('passes correct values to update query', async () => {
          try {
            await fileModel.create(mockFile);
          } catch (err) { }
          expect(mockClient.query.calledTwice);
          expect(mockClient.query.getCall(1).args[1]).to.eql(['newRev', 123]);
        });

        it('returns error', async () => {
          let err;
          try {
            await fileModel.create(mockFile);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('DB error');
        });
      });
    });

    describe('insert failure', () => {
      before(() => {
        mockClient.query.onFirstCall().rejects(new Error('db error on insert'));
      });

      it('passes correct values to insert query', async () => {
        try {
          await fileModel.create(mockFile);
        } catch (err) {}
        expect(mockClient.query.calledOnce);
        expect(mockClient.query.getCall(0).args[1]).to.eql(['name', 'remoteFileUri', 7890, 456]);
      });

      it('returns error', async () => {
        let err;
        try {
          await fileModel.create(mockFile);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('db error on insert');
      });
    });
  });
});
