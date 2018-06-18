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

  describe('#getAllServers', () => {
    describe('servers found', () => {
      before(() => {
        mockPool.query.resolves({ rows: [{ server_id: 123, server_name: 'name', _rev: 'rev', created_time: '2018-04-09', url: 'url1' },
                                         { server_id: 456, server_name: 'name1', _rev: 'rev1', created_time: '2018-04-10', url: 'url2' }] });
      });

      it('returns servers', async () => {
        let servers = await serverModel.getAllServers();
        expect(servers).to.be.ok();
        expect(servers.length).to.be(2);
        expect(servers[0].id).to.be(123);
        expect(servers[0].name).to.be('name');
        expect(servers[0]._rev).to.be('rev');
        expect(servers[0].createdTime).to.be('2018-04-09');
        expect(servers[0].url).to.be('url1');
        expect(servers[1].id).to.be(456);
        expect(servers[1].name).to.be('name1');
        expect(servers[1]._rev).to.be('rev1');
        expect(servers[1].createdTime).to.be('2018-04-10');
        expect(servers[1].url).to.be('url2');
      });

      it('logs success', async () => {
        await serverModel.getAllServers();
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Servers retrieved: %j');
      });
    });

    describe('no servers found', () => {
      before(() => {
        mockPool.query.resolves({ rows: [] });
      });

      it('returns empty', async () => {
        let servers = await serverModel.getAllServers();
        expect(servers).to.be.empty;
      });

      it('logs server not found', async () => {
        await serverModel.getAllServers();
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('There are no servers created');
      });
    });

    describe('db error', () => {
      before(() => {
        mockPool.query.rejects(new Error('DB error'));
      });

      it('returns error', async () => {
        let err;
        try {
          await serverModel.getAllServers();
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('DB error');
      });

      it('logs db failure', async () => {
        try {
          await serverModel.getAllServers();
        } catch (err) { }
        expect(mockLogger.error.calledTwice);
        expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
        expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
        expect(mockLogger.error.getCall(1).args[0]).to.be('Error retrieving the servers from the database');
      });
    });
  });

  describe('#findByServerId', () => {
    describe('server found', () => {
      before(() => {
        mockPool.query.resolves({ rows: [{ server_id: 123, server_name: 'name', _rev: 'rev', created_time: '2018-04-09', url: 'url' }] });
      });

      it('returns server', async () => {
        let server = await serverModel.findByServerId(123);
        expect(server).to.be.ok();
        expect(server.id).to.be(123);
        expect(server.name).to.be('name');
        expect(server._rev).to.be('rev');
        expect(server.createdTime).to.be('2018-04-09');
        expect(server.url).to.be('url');
      });

      it('logs success', async () => {
        await serverModel.findByServerId(123);
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Server with id:\'%s\' found');
        expect(mockLogger.info.getCall(0).args[1]).to.be(123);
      });
    });

    describe('server not found', () => {
      before(() => {
        mockPool.query.resolves({ rows: [] });
      });

      it('returns null', async () => {
        let server = await serverModel.findByServerId(123);
        expect(server).to.be.null;
      });

      it('logs server not found', async () => {
        await serverModel.findByServerId(123);
        expect(mockLogger.info.calledOnce);
        expect(mockLogger.info.getCall(0).args[0]).to.be('Server with id:\'%s\' not found');
        expect(mockLogger.info.getCall(0).args[1]).to.be(123);
      });
    });

    describe('db error', () => {
      before(() => {
        mockPool.query.rejects(new Error('DB error'));
      });

      it('returns error', async () => {
        let err;
        try {
          await serverModel.findByServerId(123);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.ok();
        expect(err.message).to.be('DB error');
      });

      it('logs db failure', async () => {
        try {
          await serverModel.findByServerId(123);
        } catch (err) { }
        expect(mockLogger.error.calledTwice);
        expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
        expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
        expect(mockLogger.error.getCall(1).args[0]).to.be('Error looking for server id:\'%s\' in the database');
        expect(mockLogger.error.getCall(1).args[1]).to.be(123);
      });
    });
  });

  describe('#findByServerName', () => {
    describe('server found', () => {
      before(() => {
        mockPool.query.resolves({ rows: [{ server_id: 123, server_name: 'name', _rev: 'rev', created_time: '2018-04-09', url: 'url' }] });
      });

      it('returns server', async () => {
        let server = await serverModel.findByServerName('name');
        expect(server).to.be.ok();
        expect(server.id).to.be(123);
        expect(server.name).to.be('name');
        expect(server._rev).to.be('rev');
        expect(server.createdTime).to.be('2018-04-09');
        expect(server.url).to.be('url');
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
    let mockServerToUpdate = {
      id: 123,
      name: 'newName',
      _rev: 'oldRev',
      url: 'newUrl',
    };

    let dbServerFound = {
      server_id: 123,
      server_name: 'name',
      _rev: 'oldRev',
      created_time: '2018-04-09',
      url: 'oldUrl',
    };

    let dbServerFoundModified = {
      server_id: 123,
      server_name: 'anotherName',
      _rev: 'anotherRev',
      created_time: '2018-04-09',
      url: 'anotherUrl',
    };

    let dbServerUpdated = {
      server_id: 123,
      server_name: 'newName',
      _rev: 'newRev',
      created_time: '2018-04-09',
      url: 'newUrl',
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
            await serverModel.update(mockServerToUpdate);
            expect(mockPool.query.getCall(0).args[1]).to.eql([123]);
          });

          it('passes correct values to update query', async () => {
            await serverModel.update(mockServerToUpdate);
            expect(mockPool.query.calledTwice);
            expect(mockPool.query.getCall(1).args[1]).to.eql(['newName', 'newRev', 'newUrl', 123]);
          });

          it('returns updated server', async () => {
            let server = await serverModel.update(mockServerToUpdate);
            expect(server.id).to.be(123);
            expect(server.name).to.be('newName');
            expect(server._rev).to.be('newRev');
            expect(server.url).to.be('newUrl');
            expect(server.createdTime).to.be('2018-04-09');
          });
        });

        describe('db error on update', () => {
          before(() => {
            mockPool.query.onSecondCall().rejects(new Error('DB error on update'));
          });

          it('passes correct values to update query', async () => {
            try {
              await serverModel.update(mockServerToUpdate);
            } catch (err) {}
            expect(mockPool.query.calledTwice);
            expect(mockPool.query.getCall(1).args[1]).to.eql(['newName', 'newRev', 'newUrl', 123]);
          });

          it('returns error', async () => {
            let err;
            try {
              await serverModel.update(mockServerToUpdate);
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
            await serverModel.update(mockServerToUpdate);
          } catch (err) { }
          expect(mockPool.query.calledOnce);
          expect(mockPool.query.getCall(0).args[1]).to.eql([123]);
        });

        it('returns error', async () => {
          let err;
          try {
            await serverModel.update(mockServerToUpdate);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.ok();
          expect(err.message).to.be('Integrity check error');
        });
      });
    });

    describe('server not found', () => {
      before(() => {
        mockPool.query.onFirstCall().resolves({ rows: [] });
      });

      it('passes correct values to find query', async () => {
        try {
          await serverModel.update(mockServerToUpdate);
        } catch (err) {}
        expect(mockPool.query.calledOnce);
        expect(mockPool.query.getCall(0).args[1]).to.eql([123]);
      });

      it('returns error', async () => {
        let err;
        try {
          await serverModel.update(mockServerToUpdate);
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
          await serverModel.update(mockServerToUpdate);
        } catch (err) {}
        expect(mockPool.query.calledOnce);
        expect(mockPool.query.getCall(0).args[1]).to.eql([123]);
      });

      it('returns error', async () => {
        let err;
        try {
          await serverModel.update(mockServerToUpdate);
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
      createdBy: 'adminUserId',
      url: 'url',
    };

    let mockDbServer = {
      server_name: 'name',
      server_id: 123,
      created_by: 'adminUserId',
      created_time: '2018-04-09',
      url: 'url',
    };

    let mockDbServerUpdated = {
      server_name: 'name',
      server_id: 123,
      _rev: 'newRev',
      created_by: 'adminUserId',
      created_time: '2018-04-09',
      url: 'url',
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
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name', 'adminUserId', 'url']);
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
          expect(server.url).to.be('url');
          expect(server.createdTime).to.be('2018-04-09');
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
        expect(mockPool.query.getCall(0).args[1]).to.eql(['name', 'adminUserId', 'url']);
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
