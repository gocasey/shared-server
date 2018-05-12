const expect = require('expect.js');
const errorMiddleware = require('../../../src/middlewares/error_middleware.js');

describe('ErrorMiddleware Tests', function() {
  let passedErrorCode;
  let passedError;

  let mockRequest = {};
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

  describe('error with status code', function() {
    let mockError = {
      statusCode: 400,
      message: 'Error message',
    };

    beforeEach(function() {
      errorMiddleware(mockError, mockRequest, mockResponse, null);
    });

    it('passes error code to status', function() {
      expect(passedErrorCode).to.be(400);
    });

    it('passes error object to json', function() {
      expect(passedError).to.eql({ 'code': 400, 'message': 'Error message' });
    });
  });

  describe('error without status code', function() {
    let mockError = {
      message: 'Error message',
    };

    beforeEach(function() {
      errorMiddleware(mockError, mockRequest, mockResponse, null);
    });

    it('passes error code to status', function() {
      expect(passedErrorCode).to.be(500);
    });

    it('passes error object to json', function() {
      expect(passedError.message).to.be('Error message');
    });
  });
});
