const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
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

describe('ServerService Tests', function() {
  let serverService;

  before(function() {
    serverService = setupServerService();
  });

  describe('#createServer', function() {
    let mockBody = {
      name: 'name',
    };

    describe('create success', function() {
      before(function() {
        mockServerModel.create.callsArgWith(1, null, { id: 1, name: 'name', _rev: 'rev' });
      });

      it('does not return error', function(done) {
        serverService.createServer(mockBody, function(err) {
          expect(err).to.be.null;
          done();
        });
      });

      it('returns server', function(done) {
        serverService.createServer(mockBody, function(err, server) {
          expect(server).to.be.ok();
          expect(server.id).to.be(1);
          expect(server.name).to.be('name');
          expect(server._rev).to.be('rev');
          done();
        });
      });
    });

    describe('create failure', function() {
      before(function() {
        mockServerModel.create.callsArgWith(1, 'Creation error');
      });

      describe('server found', function() {
        before(function() {
          mockServerModel.findByServerName.callsArgWith(1, null, { id: 1, name: 'name', _rev: 'rev' });
        });

        it('returns error', function(done) {
          serverService.createServer(mockBody, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });
      });

      describe('server not found', function() {
        before(function() {
          mockServerModel.findByServerName.callsArgWith(1, 'server not found');
        });

        it('returns error', function(done) {
          serverService.createServer(mockBody, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });
      });
    });
  });
});
