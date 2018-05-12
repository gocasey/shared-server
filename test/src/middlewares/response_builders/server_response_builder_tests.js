const expect = require('expect.js');
const sinon = require('sinon');
const ServerResponseBuilder = require('../../../../src/middlewares/response_builders/server_response_builder.js');

const mockLogger = {
  debug: sinon.stub(),
};

describe('ServerResponseBuilder Tests', function() {
  let serverResponseBuilder = new ServerResponseBuilder(mockLogger);

  let mockResponse = {
    status: function(errorCode) {
      passedErrorCode = errorCode;
      return {
        json: function(error) {
          passedError = error;
        },
      };
    },
  };

  describe('#buildResponse', function() {
    let mockRequest = {};
    let passedStatusCode;
    let returnedResponse;
    let mockResponse = {
      server: {
        id: '123',
        name: 'name',
        _rev: 'rev',
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
      serverResponseBuilder.buildResponse(mockRequest, mockResponse);
    });

    it('returns status and response', function() {
      expect(passedStatusCode).to.be(201);
      expect(returnedResponse).to.be.eql({ metadata: { version: '1.0.0' },
        server: { server: { id: '123', name: 'name', _rev: 'rev' }, token: { expiresAt: 123456789, token: 'token' } } });
    });

    it('logs response', function() {
      expect(mockLogger.debug.calledOnce);
      expect(mockLogger.debug.getCall(0).args[0]).to.be('Response: %j');
      expect(mockLogger.debug.getCall(0).args[1]).to.be.eql({ metadata: { version: '1.0.0' },
        server: { server: { id: '123', name: 'name', _rev: 'rev' }, token: { expiresAt: 123456789, token: 'token' } } });
    });
  });
});
