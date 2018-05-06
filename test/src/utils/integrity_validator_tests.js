const expect = require('expect.js');
const sinon = require('sinon');
const IntegrityValidator = require('../../../src/utils/integrity_validator.js');

const mockLogger = {
  debug: sinon.stub(),
};

const integrityValidator = new IntegrityValidator(mockLogger);

describe('IntegrityValidator Tests', function() {
  describe('user integrity check', function() {
    let mockUser = { id: 1, username: 'john', password: 'pass', applicationOwner: 'app1', rev: 'defg' };
    let mockSameUserDifferentOrder = { rev: 'abcd', username: 'john', applicationOwner: 'app1', id: 1, password: 'pass' };
    let mockDifferentUser = { rev: 'abcd', username: 'tony', applicationOwner: 'app1', id: 1, password: 'pass' };

    beforeEach(function(){
      mockLogger.debug.resetHistory();
    })

    it('returns hash', function() {
      let hash = integrityValidator.createHash(mockUser);
      expect(hash).to.be.ok();
    });

    it('logs success', function() {
      let hash = integrityValidator.createHash(mockUser);
      expect(mockLogger.debug.calledOnce);
      expect(mockLogger.debug.getCall(0).args[0]).to.be('Integrity hash: %s created for object: %j');
      expect(mockLogger.debug.getCall(0).args[1]).to.be(hash);
      expect(mockLogger.debug.getCall(0).args[2]).to.be(mockUser);
    });


    describe('same user', function(){

      it('validates hash with user', function() {
        let hash = integrityValidator.createHash(mockUser);
        expect(integrityValidator.validateHash(mockUser, hash));
      });

    });

    describe('same user different param order', function(){
      it('returns same hash', function() {
        let hash1 = integrityValidator.createHash(mockUser);
        let hash2 = integrityValidator.createHash(mockSameUserDifferentOrder);
        expect(hash1).to.be(hash2);
      });

      it('validates hash with user 1', function() {
        let hash = integrityValidator.createHash(mockUser);
        expect(integrityValidator.validateHash(hash, mockSameUserDifferentOrder));
      });

      it('validates hash with user 2', function() {
        let hash = integrityValidator.createHash(mockSameUserDifferentOrder);
        expect(integrityValidator.validateHash(mockUser, hash));
      });

      it('logs validation success', function(){
        let hash = integrityValidator.createHash(mockUser);
        integrityValidator.validateHash(mockSameUserDifferentOrder, hash);
        expect(mockLogger.debug.lastCall.args[0]).to.be('Integrity hash check succeeded for hash: %s and object: %j');
        expect(mockLogger.debug.lastCall.args[1]).to.be(hash);
        expect(mockLogger.debug.lastCall.args[2]).to.be.eql(mockSameUserDifferentOrder);
      });
    });

    describe('different user', function(){
      it('returns different hashes', function() {
        let hash1 = integrityValidator.createHash(mockUser);
        let hash2 = integrityValidator.createHash(mockDifferentUser);
        expect(hash1 !== hash2);
      });

      it('logs validation failure', function(){
        let hash = integrityValidator.createHash(mockUser);
        let hashExpected = integrityValidator.createHash(mockDifferentUser);
        integrityValidator.validateHash(mockDifferentUser, hash);
        expect(mockLogger.debug.lastCall.args[0]).to.be('Integrity hash check failed for hash: %s and object: %j. Hash expected: %s');
        expect(mockLogger.debug.lastCall.args[1]).to.be(hash);
        expect(mockLogger.debug.lastCall.args[2]).to.be.eql(mockDifferentUser);
        expect(mockLogger.debug.lastCall.args[3]).to.be(hashExpected);
      });

    });

  });
});
