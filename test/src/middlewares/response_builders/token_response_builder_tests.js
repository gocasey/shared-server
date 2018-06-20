const expect = require('expect.js');
const sinon = require('sinon');
const TokenResponseBuilder = require('../../../../src/middlewares/response_builders/token_response_builder.js');

const mockLogger = {
  debug: sinon.stub(),
};

describe('TokenResponseBuilder Tests', function() {
  let tokenResponseBuilder = new TokenResponseBuilder(mockLogger);

  describe('#buildResponse', function() {
    let mockRequest = {};
    let passedStatusCode;
    let returnedResponse;
    let mockResponse = {
      token: {
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
      tokenResponseBuilder.buildResponse(mockRequest, mockResponse, 201);
    });

    it('passes status and response', function() {
      expect(passedStatusCode).to.be(201);
      expect(returnedResponse).to.be.eql({ metadata: { version: '1.0.0' }, token: { expiresAt: 123456789, token: 'token' } });
    });

    it('logs response', function() {
      expect(mockLogger.debug.calledOnce);
      expect(mockLogger.debug.getCall(0).args[0]).to.be('Response: %j');
      expect(mockLogger.debug.getCall(0).args[1]).to.be.eql({ metadata: { version: '1.0.0' }, token: { expiresAt: 123456789, token: 'token' } });
    });
  });
});
