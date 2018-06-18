const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const ServerControllerModule = '../../../src/controllers/server_controller.js';

let mockServerService = {
  getAllServers: sinon.stub(),
  createServer: sinon.stub(),
  findServer: sinon.stub(),
  updateServer: sinon.stub(),
};

let mockServerTokenService = {
  generateToken: sinon.stub(),
  retrieveToken: sinon.stub(),
};

let mockLogger = {
  error: sinon.stub(),
};

function setupServerController() {
  let mocks = {
    '../lib/services/server_service.js': function() {
 return mockServerService;
},
    '../lib/services/server_token_service.js': function() {
 return mockServerTokenService;
},
  };
  let ServerController = proxyquire(ServerControllerModule, mocks);
  return new ServerController(mockLogger);
}

describe('ServerController Tests', () => {
  let serverController;

  before(() => {
    serverController = setupServerController();
  });

  beforeEach(() => {
    mockServerTokenService.generateToken.resetHistory();
    mockServerService.createServer.resetHistory();
    mockServerService.updateServer.resetHistory();
    mockServerService.findServer.resetHistory();
  });

  describe('#createServer', () => {
    let mockServerRequest = {
      body: {
        name: 'name',
      },
    };

    let mockResponse = {
      userAuthenticated: {
        user_id: 456,
      },
    };

    describe('success', () => {
      before(() => {
        mockServerService.createServer.resolves({ id: 123, name: 'name', _rev: 'rev', createdTime: '2018-04-09', createdBy: 456 });
      });

      it('calls server service', async () => {
        await serverController.createServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.createServer.calledOnce);
      });

      it('passes correct params to server service', async () => {
        await serverController.createServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.createServer.getCall(0).args[0]).to.be.eql({ name: 'name', createdBy: 456 });
      });

      it('saves server in response', async () => {
        await serverController.createServer(mockServerRequest, mockResponse, function() {});
        expect(mockResponse.server).to.be.ok();
        expect(mockResponse.server.id).to.be(123);
        expect(mockResponse.server.name).to.be('name');
        expect(mockResponse.server._rev).to.be('rev');
        expect(mockResponse.server.createdTime).to.be('2018-04-09');
        expect(mockResponse.server.createdBy).to.be(456);
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await serverController.createServer(mockServerRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockServerService.createServer.rejects(new Error('creation error'));
      });

      it('calls server service', async () => {
        await serverController.createServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.createServer.calledOnce);
      });

      it('passes correct params to server service', async () => {
        await serverController.createServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.createServer.getCall(0).args[0]).to.be.eql({ name: 'name', createdBy: 456 });
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await serverController.createServer(mockServerRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('creation error')));
      });
    });
  });

  describe('#findServer', () => {
    let mockServerRequest = {
      params: {
        serverId: 123,
      },
    };

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockServerService.findServer.resolves({ id: 123, name: 'name', _rev: 'rev', createdTime: '2018-04-09' });
      });

      it('calls server service', async () => {
        await serverController.findServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.findServer.calledOnce);
      });

      it('passes correct params to server service', async () => {
        await serverController.findServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.findServer.getCall(0).args[0]).to.be.eql(123);
      });

      it('saves server in response', async () => {
        await serverController.findServer(mockServerRequest, mockResponse, function() {});
        expect(mockResponse.server).to.be.ok();
        expect(mockResponse.server.id).to.be(123);
        expect(mockResponse.server.name).to.be('name');
        expect(mockResponse.server._rev).to.be('rev');
        expect(mockResponse.server.createdTime).to.be('2018-04-09');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await serverController.findServer(mockServerRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockServerService.findServer.rejects(new Error('find error'));
      });

      it('calls server service', async () => {
        await serverController.findServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.findServer.calledOnce);
      });

      it('passes correct params to server service', async () => {
        await serverController.findServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.findServer.getCall(0).args[0]).to.be.eql(123);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await serverController.findServer(mockServerRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('find error')));
      });
    });
  });

  describe('#getAllServers', () => {
    let mockServerRequest = {};
    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockServerService.getAllServers.resolves([{ id: 123, name: 'name', _rev: 'rev', createdTime: '2018-04-09' },
                                                  { id: 456, name: 'name1', _rev: 'rev1', createdTime: '2018-04-10' }]);
      });

      it('calls server service', async () => {
        await serverController.getAllServers(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.getAllServers.calledOnce);
      });

      it('saves servers in response', async () => {
        await serverController.getAllServers(mockServerRequest, mockResponse, function() {});
        expect(mockResponse.servers).to.be.ok();
        expect(mockResponse.servers.length).to.be(2);
        expect(mockResponse.servers[0].id).to.be(123);
        expect(mockResponse.servers[0].name).to.be('name');
        expect(mockResponse.servers[0]._rev).to.be('rev');
        expect(mockResponse.servers[0].createdTime).to.be('2018-04-09');
        expect(mockResponse.servers[1].id).to.be(456);
        expect(mockResponse.servers[1].name).to.be('name1');
        expect(mockResponse.servers[1]._rev).to.be('rev1');
        expect(mockResponse.servers[1].createdTime).to.be('2018-04-10');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await serverController.getAllServers(mockServerRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockServerService.getAllServers.rejects(new Error('find error'));
      });

      it('calls server service', async () => {
        await serverController.getAllServers(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.getAllServers.calledOnce);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await serverController.getAllServers(mockServerRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('find error')));
      });
    });
  });

  describe('#updateServer', () => {
    let mockServerRequest = {
      params: {
        serverId: 123,
      },
      body: {
        name: 'newName',
        _rev: 'oldRev',
      },
    };

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockServerService.updateServer.resolves({ id: 123, name: 'newName', _rev: 'newRev', createdTime: '2018-04-09' });
      });

      it('calls server service', async () => {
        await serverController.updateServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.updateServer.calledOnce);
      });

      it('passes correct params to server service', async () => {
        await serverController.updateServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.updateServer.getCall(0).args[0]).to.be.eql({ id: 123, name: 'newName', _rev: 'oldRev' });
      });

      it('saves server in response', async () => {
        await serverController.updateServer(mockServerRequest, mockResponse, function() {});
        expect(mockResponse.server).to.be.ok();
        expect(mockResponse.server.id).to.be(123);
        expect(mockResponse.server.name).to.be('newName');
        expect(mockResponse.server._rev).to.be('newRev');
        expect(mockResponse.server.createdTime).to.be('2018-04-09');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await serverController.updateServer(mockServerRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockServerService.updateServer.rejects(new Error('update error'));
      });

      it('calls server service', async () => {
        await serverController.updateServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.updateServer.calledOnce);
      });

      it('passes correct params to server service', async () => {
        await serverController.updateServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.updateServer.getCall(0).args[0]).to.be.eql({ id: 123, name: 'newName', _rev: 'oldRev' });
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await serverController.updateServer(mockServerRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('update error')));
      });
    });
  });

  describe('#generateToken', () => {
    let mockServerResponse = {
      server: {
        id: 123,
        name: 'name',
        _rev: 'rev',
        createdTime: '2018-04-09',
      },
    };

    let mockRequest = {};

    describe('success', () => {
      before(() => {
        mockServerTokenService.generateToken.resolves({ token_id: 456, server_id: 123, token: 'token' });
      });

      it('calls server token service', async () => {
        await serverController.generateToken(mockRequest, mockServerResponse, function() {});
        expect(mockServerTokenService.generateToken.calledOnce);
      });

      it('passes correct params to server token service', async () => {
        await serverController.generateToken(mockRequest, mockServerResponse, function() {});
        expect(mockServerTokenService.generateToken.getCall(0).args[0]).to.be.eql(mockServerResponse.server);
      });

      it('saves token in response', async () => {
        await serverController.generateToken(mockRequest, mockServerResponse, function() {});
        expect(mockServerResponse.serverToken).to.be.ok();
        expect(mockServerResponse.serverToken.token_id).to.be(456);
        expect(mockServerResponse.serverToken.server_id).to.be(123);
        expect(mockServerResponse.serverToken.token).to.be('token');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await serverController.generateToken(mockRequest, mockServerResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockServerTokenService.generateToken.rejects(new Error('token creation error'));
      });

      it('calls server token service', async () => {
        await serverController.generateToken(mockRequest, mockServerResponse, function() {});
        expect(mockServerTokenService.generateToken.calledOnce);
      });

      it('passes correct params to server token service', async () => {
        await serverController.generateToken(mockRequest, mockServerResponse, function() {});
        expect(mockServerTokenService.generateToken.getCall(0).args[0]).to.be.eql(mockServerResponse.server);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await serverController.generateToken(mockRequest, mockServerResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('token creation error')));
      });
    });
  });

  describe('#retrieveToken', () => {
    let mockServerResponse = {
      server: {
        id: 123,
        name: 'name',
        _rev: 'rev',
        createdTime: '2018-04-09',
      },
    };

    let mockRequest = {};

    describe('success', () => {
      before(() => {
        mockServerTokenService.retrieveToken.resolves({ token_id: 456, server_id: 123, token: 'token' });
      });

      it('calls server token service', async () => {
        await serverController.retrieveToken(mockRequest, mockServerResponse, function() {});
        expect(mockServerTokenService.retrieveToken.calledOnce);
      });

      it('passes correct params to server token service', async () => {
        await serverController.retrieveToken(mockRequest, mockServerResponse, function() {});
        expect(mockServerTokenService.retrieveToken.getCall(0).args[0]).to.be.eql(mockServerResponse.server);
      });

      it('saves token in response', async () => {
        await serverController.retrieveToken(mockRequest, mockServerResponse, function() {});
        expect(mockServerResponse.serverToken).to.be.ok();
        expect(mockServerResponse.serverToken.token_id).to.be(456);
        expect(mockServerResponse.serverToken.server_id).to.be(123);
        expect(mockServerResponse.serverToken.token).to.be('token');
      });

      it('calls next with no error', async () => {
        let mockNext = sinon.stub();
        await serverController.retrieveToken(mockRequest, mockServerResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(undefined));
      });
    });


    describe('failure', () => {
      before(() => {
        mockServerTokenService.retrieveToken.rejects(new Error('token error'));
      });

      it('calls server token service', async () => {
        await serverController.retrieveToken(mockRequest, mockServerResponse, function() {});
        expect(mockServerTokenService.retrieveToken.calledOnce);
      });

      it('passes correct params to server token service', async () => {
        await serverController.retrieveToken(mockRequest, mockServerResponse, function() {});
        expect(mockServerTokenService.retrieveToken.getCall(0).args[0]).to.be.eql(mockServerResponse.server);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await serverController.retrieveToken(mockRequest, mockServerResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('token error')));
      });
    });
  });
});
