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

describe('ServerModel Tests', function() {
  beforeEach(function() {
    mockLogger.info.resetHistory();
    mockLogger.error.resetHistory();
    mockLogger.warn.resetHistory();
    mockLogger.debug.resetHistory();
    mockPool.query.resetHistory();
  });

  describe('#findByServerName', function() {
    describe('server found', function() {
      before(function() {
        mockPool.query.callsArgWith(2, null, { rows: [{ server_id: 123, server_name: 'name', _rev: 'rev' }] });
      });

      it('returns server', function(done) {
        serverModel.findByServerName('name', function(err, server) {
          expect(server).to.be.ok();
          expect(server.id).to.be(123);
          expect(server.name).to.be('name');
          expect(server._rev).to.be('rev');
          done();
        });
      });

      it('logs success', function(done) {
        serverModel.findByServerName('name', function() {
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('Server with name:\'%s\' found');
          expect(mockLogger.info.getCall(0).args[1]).to.be('name');
          done();
        });
      });
    });

    describe('server not found', function() {
      before(function() {
        mockPool.query.callsArgWith(2, null, { rows: [] } );
      });

      it('returns error', function(done) {
        serverModel.findByServerName('name', function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs server not found', function(done) {
        serverModel.findByServerName('name', function() {
          expect(mockLogger.info.calledOnce);
          expect(mockLogger.info.getCall(0).args[0]).to.be('Server with name:\'%s\' not found');
          expect(mockLogger.info.getCall(0).args[1]).to.be('name');
          done();
        });
      });
    });

    describe('db error', function() {
      before(function() {
        mockPool.query.callsArgWith(2, 'DB error');
      });

      it('returns error', function(done) {
        serverModel.findByServerName('name', function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('logs db failure', function(done) {
        serverModel.findByServerName('name', function() {
          expect(mockLogger.error.calledTwice);
          expect(mockLogger.error.getCall(0).args[0]).to.be('DB error: %j');
          expect(mockLogger.error.getCall(0).args[1]).to.be('DB error');
          expect(mockLogger.error.getCall(1).args[0]).to.be('Error looking for server name:\'%s\' in the database');
          expect(mockLogger.error.getCall(1).args[1]).to.be('name');
          done();
        });
      });
    });
  });

  describe('#update', function() {
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

    describe('server found', function() {
      describe('server not modified', function() {
        before(function() {
          mockPool.query.onFirstCall().callsArgWith(2, null, { rows: [dbServerFound] });
        });

        it('passes correct values to find query', function(done) {
          serverModel.update(mockServer, function() {
            expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
            done();
          });
        });

        describe('update success', function() {
          before(function() {
            mockPool.query.onSecondCall().callsArgWith(2, null, { rows: [dbServerUpdated] });
          });

          it('passes correct values to update query', function(done) {
            serverModel.update(mockServer, function() {
              expect(mockPool.query.calledTwice);
              expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
              done();
            });
          });

          it('does not return error', function(done) {
            serverModel.update(mockServer, function(err) {
              expect(err).to.be.null;
              done();
            });
          });

          it('returns updated server', function(done) {
            serverModel.update(mockServer, function(err, server) {
              expect(server.id).to.be(123);
              expect(server.name).to.be('name');
              expect(server._rev).to.be('newRev');
              done();
            });
          });
        });


        describe('db error on update', function() {
          before(function() {
            mockPool.query.onSecondCall().callsArgWith(2, 'DB error on update');
          });

          it('passes correct values to update query', function(done) {
            serverModel.update(mockServer, function() {
              expect(mockPool.query.calledTwice);
              expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
              done();
            });
          });

          it('returns error', function(done) {
            serverModel.update(mockServer, function(err) {
              expect(err).to.be.ok();
              done();
            });
          });

          it('does not return server', function(done) {
            serverModel.update(mockServer, function(err, server) {
              expect(server).to.be.null;
              done();
            });
          });
        });
      });

      describe('server modified', function() {
        before(function() {
          mockPool.query.onFirstCall().callsArgWith(2, null, { rows: [dbServerFoundModified] });
        });

        it('passes correct values to find query', function(done) {
          serverModel.update(mockServer, function() {
            expect(mockPool.query.calledOnce);
            expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
            done();
          });
        });

        it('returns error', function(done) {
          serverModel.update(mockServer, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });

        it('does not return server', function(done) {
          serverModel.update(mockServer, function(err, server) {
            expect(server).to.be.null;
            done();
          });
        });
      });
    });

    describe('server not found', function() {
      before(function() {
        mockPool.query.onFirstCall().callsArgWith(2, null, { rows: [] });
      });

      it('passes correct values to find query', function(done) {
        serverModel.update(mockServer, function() {
          expect(mockPool.query.calledOnce);
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
          done();
        });
      });

      it('returns error', function(done) {
        serverModel.update(mockServer, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('does not return server', function(done) {
        serverModel.update(mockServer, function(err, server) {
          expect(server).to.be.null;
          done();
        });
      });
    });

    describe('db failure on find', function() {
      before(function() {
        mockPool.query.onFirstCall().callsArgWith(2, 'db failure on find');
      });

      it('passes correct values to find query', function(done) {
        serverModel.update(mockServer, function() {
          expect(mockPool.query.calledOnce);
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
          done();
        });
      });

      it('returns error', function(done) {
        serverModel.update(mockServer, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('does not return server', function(done) {
        serverModel.update(mockServer, function(err, server) {
          expect(server).to.be.null;
          done();
        });
      });
    });
  });


  describe('#create', function() {
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

    describe('insert success', function() {
      before(function() {
        mockPool.query.onFirstCall().callsArgWith(2, null, { rows: [mockDbServer] });
      });

      it('passes correct values to insert query', function(done) {
        serverModel.create(mockServer, function() {
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
          done();
        });
      });

      describe('update success', function() {
        before(function() {
          mockPool.query.onSecondCall().callsArgWith(2, null, { rows: [mockDbServerUpdated] });
        });

        it('passes correct values to update query', function(done) {
          serverModel.create(mockServer, function() {
            expect(mockPool.query.calledTwice);
            expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
            done();
          });
        });

        it('does not return error', function(done) {
          serverModel.create(mockServer, function(err) {
            expect(err).to.be.null;
            done();
          });
        });

        it('returns updated server', function(done) {
          serverModel.create(mockServer, function(err, server) {
            expect(server.id).to.be(123);
            expect(server.name).to.be('name');
            expect(server._rev).to.be('newRev');
            done();
          });
        });
      });

      describe('db error on update', function() {
        before(function() {
          mockPool.query.onSecondCall().callsArgWith(2, 'DB error');
        });

        it('passes correct values to update query', function(done) {
          serverModel.create(mockServer, function() {
            expect(mockPool.query.calledTwice);
            expect(mockPool.query.getCall(1).args[1]).to.eql(['newRev', 'name']);
            done();
          });
        });

        it('returns error', function(done) {
          serverModel.create(mockServer, function(err) {
            expect(err).to.be.ok();
            done();
          });
        });

        it('does not return server', function(done) {
          serverModel.create(mockServer, function(err, server) {
            expect(server).to.be.null;
            done();
          });
        });
      });
    });

    describe('insert failure', function() {
      before(function() {
        mockPool.query.onFirstCall().callsArgWith(2, 'db error on insert');
      });

      it('passes correct values to insert query', function(done) {
        serverModel.create(mockServer, function() {
          expect(mockPool.query.calledOnce);
          expect(mockPool.query.getCall(0).args[1]).to.eql(['name']);
          done();
        });
      });

      it('returns error', function(done) {
        serverModel.create(mockServer, function(err) {
          expect(err).to.be.ok();
          done();
        });
      });

      it('does not return server', function(done) {
        serverModel.create(mockServer, function(err, server) {
          expect(server).to.be.null;
          done();
        });
      });
    });
  });
});
