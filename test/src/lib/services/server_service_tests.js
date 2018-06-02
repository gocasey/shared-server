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
        mockServerModel.create.resolves({ id: 1, name: 'name', _rev: 'rev' });
      });

      it('returns server', async () => {
        let server = await serverService.createServer(mockBody);
        expect(server).to.be.ok();
        expect(server.id).to.be(1);
        expect(server.name).to.be('name');
        expect(server._rev).to.be('rev');
      });
    });

    describe('create failure', () => {
      before(() => {
        mockServerModel.create.rejects(new Error('Creation error'));
      });

      describe('server found', () => {
        before(() => {
          mockServerModel.findByServerName.resolves({ id: 1, name: 'name', _rev: 'rev' });
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
        mockServerModel.update.resolves({ id: 1, name: 'newName', _rev: 'newRev' });
      });

      it('returns server', async () => {
        let server = await serverService.updateServer(mockBody);
        expect(server).to.be.ok();
        expect(server.id).to.be(1);
        expect(server.name).to.be('newName');
        expect(server._rev).to.be('newRev');
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

      it('throws 500 error', async () => {
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

      it('throws 500 error', async () => {
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
        mockServerModel.findByServerId.resolves({ id: 1, name: 'name', _rev: 'rev' });
      });

      it('returns server', async () => {
        let server = await serverService.findServer(mockBody);
        expect(server).to.be.ok();
        expect(server.id).to.be(1);
        expect(server.name).to.be('name');
        expect(server._rev).to.be('rev');
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
        expect(err.message).to.be('Server not found');
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
});
