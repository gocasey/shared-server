const expect = require('expect.js');
const sinon = require('sinon');
const ServerResponseBuilder = require('../../../../src/middlewares/response_builders/server_response_builder.js');

const mockLogger = {
  debug: sinon.stub(),
};

describe('ServerResponseBuilder Tests', function() {
  let serverResponseBuilder = new ServerResponseBuilder(mockLogger);

  describe('#buildResponse', function() {
    let mockRequest = {};
    let passedStatusCode;
    let returnedResponse;
    let mockResponse = {
      server: {
        id: '123',
        name: 'name',
        _rev: 'rev',
        createdTime: '2018-04-09',
        lastConnection: '2018-04-10',
      },
      serverToken: {
        token: 'token',
        tokenExpiration: 123456789,
      },
      status: function(statusCode) {
        passedStatusCode = statusCode;
        return {
          json: function(responseBody) {
            returnedResponse = responseBody;
          },
        };
      },
    };

    beforeEach(function() {
      mockLogger.debug.resetHistory();
      serverResponseBuilder.buildSingleResponse(mockRequest, mockResponse);
    });

    it('returns status and response', function() {
      expect(passedStatusCode).to.be(201);
      expect(returnedResponse).to.be.eql({ metadata: { version: '1.0.0' },
        server: { server: { id: '123', name: 'name', _rev: 'rev', createdTime: '2018-04-09', lastConnection: '2018-04-10' },
                  token: { expiresAt: 123456789, token: 'token' } } });
    });

    it('logs response', function() {
      expect(mockLogger.debug.calledOnce);
      expect(mockLogger.debug.getCall(0).args[0]).to.be('Response: %j');
      expect(mockLogger.debug.getCall(0).args[1]).to.be.eql({ metadata: { version: '1.0.0' },
        server: { server: { id: '123', name: 'name', _rev: 'rev', createdTime: '2018-04-09', lastConnection: '2018-04-10' },
                  token: { expiresAt: 123456789, token: 'token' } } });
    });
  });

  describe('#buildSetResponse', function() {
    let mockRequest = {};
    let passedStatusCode;
    let returnedResponse;
    let mockResponse = {
      servers: [{
        id: '123',
        name: 'name1',
        _rev: 'rev1',
        createdTime: '2018-04-09',
        lastConnection: '2018-04-10',
      }, {
        id: '456',
        name: 'name2',
        _rev: 'rev2',
        createdTime: '2018-04-10',
        lastConnection: '2018-04-11',
      }],
      status: function(statusCode) {
        passedStatusCode = statusCode;
        return {
          json: function(responseBody) {
            returnedResponse = responseBody;
          },
        };
      },
    };

    beforeEach(function() {
      mockLogger.debug.resetHistory();
      serverResponseBuilder.buildSetResponse(mockRequest, mockResponse);
    });

    it('returns status and response', function() {
      expect(passedStatusCode).to.be(200);
      expect(returnedResponse).to.be.eql({ metadata: { version: '1.0.0' },
        servers: [{ id: '123', name: 'name1', _rev: 'rev1', createdTime: '2018-04-09', lastConnection: '2018-04-10' },
            { id: '456', name: 'name2', _rev: 'rev2', createdTime: '2018-04-10', lastConnection: '2018-04-11' }] });
    });

    it('logs response', function() {
      expect(mockLogger.debug.calledOnce);
      expect(mockLogger.debug.getCall(0).args[0]).to.be('Response: %j');
      expect(mockLogger.debug.getCall(0).args[1]).to.be.eql({ metadata: { version: '1.0.0' },
        servers: [{ id: '123', name: 'name1', _rev: 'rev1', createdTime: '2018-04-09', lastConnection: '2018-04-10' },
          { id: '456', name: 'name2', _rev: 'rev2', createdTime: '2018-04-10', lastConnection: '2018-04-11' }] });
    });
  });
});
