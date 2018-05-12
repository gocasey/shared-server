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
});
