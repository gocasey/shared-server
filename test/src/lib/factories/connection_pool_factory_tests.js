const expect = require('expect.js');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const ConnectionPoolFactoryModule = '../../../../src/lib/factories/connection_pool_factory.js';

var mockLogger = {
  debug: sinon.stub()
};

function setupConnectionPoolFactory(){
  var mockPool = sinon.stub();
  var mocks = {
    'pg' : {
      Pool : function(){
        return mockPool;
      }
    }
  };
  var ConnectionPoolFactory = proxyquire(ConnectionPoolFactoryModule, mocks);
  return new ConnectionPoolFactory(mockLogger);
}

describe('ConnectionPoolFactory Tests', function(){

  var connectionPoolFactory;

  before(function(){
    connectionPoolFactory = setupConnectionPoolFactory();
  });

  describe('#createPool', function(){

    it('returns pool', function(done){
      var pool = connectionPoolFactory.createPool();
      expect(pool).to.be.ok();
      done();
    });

  });

});
