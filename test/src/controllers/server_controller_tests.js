const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const ServerControllerModule = '../../../src/controllers/server_controller.js';

let mockServerService = {
  createServer: sinon.stub(),
};

let mockServerTokenService = {
  generateToken: sinon.stub(),
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
  });

  describe('#createServer', () => {
    let mockServerRequest = {
      body: {
        name: 'name',
      },
    };

    let mockResponse = {};

    describe('success', () => {
      before(() => {
        mockServerService.createServer.resolves({ id: 123, name: 'name', _rev: 'rev' });
      });

      it('calls server service', async () => {
        await serverController.createServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.createServer.calledOnce);
      });

      it('passes correct params to server service', async () => {
        await serverController.createServer(mockServerRequest, mockResponse, function() {});
        expect(mockServerService.createServer.getCall(0).args[0]).to.be.eql(mockServerRequest.body);
      });

      it('saves server in response', async () => {
        await serverController.createServer(mockServerRequest, mockResponse, function() {});
        expect(mockResponse.server).to.be.ok();
        expect(mockResponse.server.id).to.be(123);
        expect(mockResponse.server.name).to.be('name');
        expect(mockResponse.server._rev).to.be('rev');
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
        expect(mockServerService.createServer.getCall(0).args[0]).to.be.eql(mockServerRequest.body);
      });

      it('calls next with error', async () => {
        let mockNext = sinon.stub();
        await serverController.createServer(mockServerRequest, mockResponse, mockNext);
        expect(mockNext.calledOnce);
        expect(mockNext.calledWith(new Error('creation error')));
      });
    });
  });

  describe('#generateToken', () => {
    let mockServerResponse = {
      server: {
        id: 123,
        name: 'name',
        _rev: 'rev',
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
});
