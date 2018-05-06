const expect = require('expect.js');
const IntegrityValidator = require('../../../src/utils/integrity_validator.js');
const integrityValidator = new IntegrityValidator();

describe('IntegrityValidator Tests', function() {
  describe('user integrity check', function() {
    let mockUser = { id: 1, username: 'john', password: 'pass', applicationOwner: 'app1', rev: 'defg' };
    let mockUserDifferentOrder = { rev: 'abcd', username: 'john', applicationOwner: 'app1', id: 1, password: 'pass' };

    it('returns hash', function() {
      let hash = integrityValidator.createHash(mockUser);
      expect(hash).to.be.ok();
    });

    it('validates hash with user', function() {
      let hash = integrityValidator.createHash(mockUser);
      expect(integrityValidator.validateHash(hash, mockUser));
    });

    it('returns same hash for different params order', function() {
      let hash1 = integrityValidator.createHash(mockUser);
      let hash2 = integrityValidator.createHash(mockUserDifferentOrder);
      expect(hash1 === hash2);
    });

    it('validates hash with different params order 1', function() {
      let hash = integrityValidator.createHash(mockUser);
      expect(integrityValidator.validateHash(hash, mockUserDifferentOrder));
    });

    it('validates hash with different params order 2', function() {
      let hash = integrityValidator.createHash(mockUserDifferentOrder);
      expect(integrityValidator.validateHash(hash, mockUser));
    });
  });
});
