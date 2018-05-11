const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const ServerModelModule = '../../../src/models/server_model.js';

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
  warn: sinon.stub(),
  debug: sinon.stub(),
};

const mockPool = {
  query: sinon.stub(),
};

const mockIntegrityValidator = {
  createHash: sinon.stub(),
};

function createServerModel() {
  mockIntegrityValidator.createHash.returns('newRev');
  let mocks = { '../../src/utils/integrity_validator.js': function() {
 return mockIntegrityValidator;
} };
  let ServerModel = proxyquire(ServerModelModule, mocks);
  return new ServerModel(mockLogger, mockPool);
}

const serverModel = createServerModel();

describe('ServerModel Tests', () => {
  beforeEach(() => {
    mockLogger.info.resetHistory();
    mockLogger.error.resetHistory();
    mockLogger.warn.resetHistory();
    mockLogger.debug.resetHistory();
    mockPool.query.resetHistory();
  });

  describe('#findByServerName', () => {
    describe('server found', () => {
      before(() => {
        mockPool.query.resolves({ rows: [{ server_id: 123, server_name: 'name', _rev: 'rev' }] });
      });

      it('returns server', async () => {
        let server = await serverModel.findByServerName('name');
        expect(server).to.be.ok();
        expect(server.id).to.be(123);
        expect(server.name).to.be('name');
        expect(server._rev).to.be('rev');
      });

      it('logs success', async () => {
        await serverModel.findByServerName('name');
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Server with name:\'%s\' found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('name');
      });
    });

    describe('server not found', () => {
      before(() => {
        mockPool.query.resolves({ rows: [] });
      });

      it('returns null', async () => {
        let server = await serverModel.findByServerName('name');
        expect(server).to.be.null;
      });

      it('logs server not found', async () => {
        await serverModel.findByServerName('name');
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Server with name:\'%s\' not found');
        expect(mockLogger.info.getCall(0).args[1]).to.be('name');
      });
    });

    describe('db error', () => {
      before(() => {
        mockPool.query.rejects(new Error('DB error'));
      });

      it('returns error', async () => {
        let err;
        try {
          await serverModel.findByServerName('name');
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('DB error');
      });

      it('logs db failure', async () => {
        try {
          await serverModel.findByServerName('name');
        } catch (err) { }
        expect(mockLogger.error.calledTwice);
        expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
        expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
        expect(mockLogger.error.getCall(1).args[0]).to.be('Error looking for server name:\'%s\' in the database');
        expect(mockLogger.error.getCall(1).args[1]).to.be('name');
      });
    });
  });

  describe('#update', () => {
    let mockServer = {
      name: 'name',
      _rev: 'oldRev',
    };

    let dbServerFound = {
      server_id: 123,
      server_name: 'name',
      _rev: 'oldRev',
    };

    let dbServerFoundModified = {
      server_id: 123,
      server_name: 'name',
      _rev: 'anotherRev',
    };

    let dbServerUpdated = {
      server_id: 123,
      server_name: 'name',
      _rev: 'newRev',
    };

    describe('server found', () => {
      describe('server not modified', () => {
        before(() => {
          mockPool.query.onFirstCall().resolves({ rows: [dbServerFound] });
        });

        describe('update success', () => {
          before(() => {
            mockPool.query.onSecondCall().resolves({ rows: [dbServerUpdated] });
          });

          it('passes correct values to find query', async () => {
            await serverModel.update(mockServer);
            expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
          });

          it('passes correct values to update query', async () => {
            await serverModel.update(mockServer);
            expect(mockPool.query.calledTwice);
            expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
          });

          it('returns updated server', async () => {
            let server = await serverModel.update(mockServer);
            expect(server.id).to.be(123);
            expect(server.name).to.be('name');
            expect(server._rev).to.be('newRev');
          });
        });

        describe('db error on update', () => {
          before(() => {
            mockPool.query.onSecondCall().rejects(new Error('DB error on update'));
          });

          it('passes correct values to update query', async () => {
            try {
              await serverModel.update(mockServer);
            } catch (err) {}
            expect(mockPool.query.calledTwice);
            expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
          });

          it('returns error', async () => {
            let err;
            try {
              await serverModel.update(mockServer);
            } catch (ex) {
              err = ex;
            }
            expect(err).to.be.ok();
            expect(err.message).to.be('DB error on update');
          });
        });
      });

      describe('server modified', () => {
        before(() => {
          mockPool.query.onFirstCall().resolves({ rows: [dbServerFoundModified] });
        });

        it('passes correct values to find query', async () => {
          try {
            await serverModel.update(mockServer);
          } catch (err) { }
          expect(mockPool.query.calledOnce);
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
        });

        it('returns error', async () => {
          let err;
          try {
            await serverModel.update(mockServer);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('Error updating');
        });
      });
    });

    describe('server not found', () => {
      before(() => {
        mockPool.query.onFirstCall().resolves({ rows: [] });
      });

      it('passes correct values to find query', async () => {
        try {
          await serverModel.update(mockServer);
        } catch (err) {}
        expect(mockPool.query.calledOnce);
        expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
      });

      it('returns error', async () => {
        let err;
        try {
          await serverModel.update(mockServer);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('Server does not exist');
      });
    });

    describe('db failure on find', () => {
      before(() => {
        mockPool.query.onFirstCall().rejects(new Error('db failure on find'));
      });

      it('passes correct values to find query', async () => {
        try {
          await serverModel.update(mockServer);
        } catch (err) {}
        expect(mockPool.query.calledOnce);
        expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
      });

      it('returns error', async () => {
        let err;
        try {
          await serverModel.update(mockServer);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('db failure on find');
      });
    });
  });

  describe('#create', () => {
    let mockServer = {
      name: 'name',
    };

    let mockDbServer = {
      server_name: 'name',
      server_id: 123,
    };

    let mockDbServerUpdated = {
      server_name: 'name',
      server_id: 123,
      _rev: 'newRev',
    };

    describe('insert success', () => {
      before(() => {
        mockPool.query.onFirstCall().resolves({ rows: [mockDbServer] });
      });

      describe('update success', () => {
        before(() => {
          mockPool.query.onSecondCall().resolves({ rows: [mockDbServerUpdated] });
        });

        it('passes correct values to insert query', async () => {
          await serverModel.create(mockServer);
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
        });

        it('passes correct values to update query', async () => {
          await serverModel.create(mockServer);
          expect(mockPool.query.calledTwice);
          expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
        });

        it('returns updated server', async () => {
          let server = await serverModel.create(mockServer);
          expect(server.id).to.be(123);
          expect(server.name).to.be('name');
          expect(server._rev).to.be('newRev');
        });
      });

      describe('db error on update', () => {
        before(() => {
          mockPool.query.onSecondCall().rejects(new Error('DB error'));
        });

        it('passes correct values to update query', async () => {
          try {
            await serverModel.create(mockServer);
          } catch (err) { }
          expect(mockPool.query.calledTwice);
          expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
        });

        it('returns error', async () => {
          let err;
          try {
            await serverModel.create(mockServer);
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
        mockPool.query.onFirstCall().rejects(new Error('db error on insert'));
      });

      it('passes correct values to insert query', async () => {
        try {
          await serverModel.create(mockServer);
        } catch (err) {}
        expect(mockPool.query.calledOnce);
        expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
      });

      it('returns error', async () => {
        let err;
        try {
          await serverModel.create(mockServer);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('db error on insert');
      });
    });
  });
});
