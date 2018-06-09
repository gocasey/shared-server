const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const BaseHttpError = require('../../../../src/errors/base_http_error.js');
const ServerServiceModule = '../../../../src/lib/services/server_service.js';

const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub(),
};

const mockServerModel = {
  getAllServers: sinon.stub(),
  findByServerId: sinon.stub(),
  findByServerName: sinon.stub(),
  update: sinon.stub(),
  create: sinon.stub(),
};

function setupServerService() {
  let mocks = {
    '../../models/server_model.js': function() {
      return mockServerModel;
    },
  };
  let ServerService = proxyquire(ServerServiceModule, mocks);
  return new ServerService(mockLogger);
}

describe('ServerService Tests', () => {
  let serverService;

  before(() => {
    serverService = setupServerService();
  });

  describe('#createServer', () => {
    let mockBody = {
      name: 'name',
    };

    describe('create success', () => {
      before(() => {
        mockServerModel.create.resolves({ id: 1, name: 'name', _rev: 'rev', createdTime: '2018-04-09' });
      });

      it('returns server', async () => {
        let server = await serverService.createServer(mockBody);
        expect(server).to.be.ok();
        expect(server.id).to.be(1);
        expect(server.name).to.be('name');
        expect(server._rev).to.be('rev');
        expect(server.createdTime).to.be('2018-04-09');
      });
    });

    describe('create failure', () => {
      before(() => {
        mockServerModel.create.rejects(new Error('Creation error'));
      });

      describe('server found', () => {
        before(() => {
          mockServerModel.findByServerName.resolves({ id: 1, name: 'name', _rev: 'rev', createdTime: '2018-04-09' });
        });

        it('returns error', async () => {
          let err;
          try {
            await serverService.createServer(mockBody);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.a(BaseHttpError);
          expect(err.statusCode).to.be(400);
          expect(err.message).to.be('Server name already exists');
        });
      });

      describe('server not found', () => {
        before(() => {
          mockServerModel.findByServerName.rejects(new Error('server not found'));
        });

        it('returns error', async () => {
          let err;
          try {
            await serverService.createServer(mockBody);
          } catch (ex) {
            err = ex;
          }
          expect(err).to.be.a(BaseHttpError);
          expect(err.statusCode).to.be(500);
          expect(err.message).to.be('Server creation error');
        });
      });
    });
  });

  describe('#updateServer', () => {
    let mockBody = {
      id: 1,
      name: 'newName',
      _rev: 'oldRev',
    };

    describe('update success', () => {
      before(() => {
        mockServerModel.update.resolves({ id: 1, name: 'newName', _rev: 'newRev', createdTime: '2018-04-09' });
      });

      it('returns server', async () => {
        let server = await serverService.updateServer(mockBody);
        expect(server).to.be.ok();
        expect(server.id).to.be(1);
        expect(server.name).to.be('newName');
        expect(server._rev).to.be('newRev');
        expect(server.createdTime).to.be('2018-04-09');
      });
    });

    describe('update failure', () => {
      before(() => {
        mockServerModel.update.rejects(new Error('Update error'));
      });

      it('throws 500 error', async () => {
        let err;
        try {
          await serverService.updateServer(mockBody);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.a(BaseHttpError);
        expect(err.statusCode).to.be(500);
        expect(err.message).to.be('Server update error');
      });
    });

    describe('integrity check failure', () => {
      before(() => {
        mockServerModel.update.rejects(new Error('Integrity check error'));
      });

      it('throws 409 error', async () => {
        let err;
        try {
          await serverService.updateServer(mockBody);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.a(BaseHttpError);
        expect(err.statusCode).to.be(409);
        expect(err.message).to.be('Integrity check error');
      });
    });

    describe('server not found', () => {
      before(() => {
        mockServerModel.update.rejects(new Error('Server does not exist'));
      });

      it('throws 404 error', async () => {
        let err;
        try {
          await serverService.updateServer(mockBody);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.a(BaseHttpError);
        expect(err.statusCode).to.be(404);
        expect(err.message).to.be('Server does not exist');
      });
    });
  });

  describe('#findServer', () => {
    let mockBody = {
      id: 1,
    };

    describe('server found', () => {
      before(() => {
        mockServerModel.findByServerId.resolves({ id: 1, name: 'name', _rev: 'rev', createdTime: '2018-04-09' });
      });

      it('returns server', async () => {
        let server = await serverService.findServer(mockBody);
        expect(server).to.be.ok();
        expect(server.id).to.be(1);
        expect(server.name).to.be('name');
        expect(server._rev).to.be('rev');
        expect(server.createdTime).to.be('2018-04-09');
      });
    });

    describe('server not found', () => {
      before(() => {
        mockServerModel.findByServerId.resolves();
      });

      it('throws 404 error', async () => {
        let err;
        try {
          await serverService.findServer(mockBody);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.a(BaseHttpError);
        expect(err.statusCode).to.be(404);
        expect(err.message).to.be('Server does not exist');
      });
    });

    describe('find failure', () => {
      before(() => {
        mockServerModel.findByServerId.rejects(new Error('Find error'));
      });

      it('throws 500 error', async () => {
        let err;
        try {
          await serverService.findServer(mockBody);
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.a(BaseHttpError);
        expect(err.statusCode).to.be(500);
        expect(err.message).to.be('Server find error');
      });
    });
  });

  describe('#getAllServers', () => {
    describe('servers found', () => {
      before(() => {
        mockServerModel.getAllServers.resolves([{ id: 1, name: 'name', _rev: 'rev', createdTime: '2018-04-09' },
                                                { id: 2, name: 'name1', _rev: 'rev1', createdTime: '2018-04-10' }]);
      });

      it('returns servers', async () => {
        let servers = await serverService.getAllServers();
        expect(servers).to.be.ok();
        expect(servers.length).to.be(2);
        expect(servers[0].id).to.be(1);
        expect(servers[0].name).to.be('name');
        expect(servers[0]._rev).to.be('rev');
        expect(servers[0].createdTime).to.be('2018-04-09');
        expect(servers[1].id).to.be(2);
        expect(servers[1].name).to.be('name1');
        expect(servers[1]._rev).to.be('rev1');
        expect(servers[1].createdTime).to.be('2018-04-10');
      });
    });

    describe('servers not found', () => {
      before(() => {
        mockServerModel.getAllServers.resolves([]);
      });

      it('returns empty', async () => {
        let servers = await serverService.getAllServers();
        expect(servers).to.be.empty;
      });
    });

    describe('find failure', () => {
      before(() => {
        mockServerModel.getAllServers.rejects(new Error('Find error'));
      });

      it('throws 500 error', async () => {
        let err;
        try {
          await serverService.getAllServers();
        } catch (ex) {
          err = ex;
        }
        expect(err).to.be.a(BaseHttpError);
        expect(err.statusCode).to.be(500);
        expect(err.message).to.be('Servers retrieval error');
      });
    });
  });
});
