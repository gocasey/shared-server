const hash = require('object-hash');

function IntegrityValidator(logger) {
  let _logger = logger;

  function hashOptions() {
    return {
      algorithm: 'md5', encoding: 'base64', excludeKeys: function(key) {
        if (key === '_rev' || key === 'last_connection') return true;
        return false;
      },
    };
  }

  this.createHash = function(object) {
    let objectHash = hash(object, hashOptions());
    _logger.debug('Integrity hash: %s created for object: %j', objectHash, object);
    return objectHash;
  };

  this.validateHash = function(object, hash) {
    let objectHash = this.createHash(object);
    if (objectHash === hash) {
      _logger.debug('Integrity hash check succeeded for hash: %s and object: %j', hash, object);
      return true;
    } else {
      _logger.debug('Integrity hash check failed for hash: %s and object: %j. Hash expected: %s', hash, object, objectHash);
      return false;
    }
  };
}

module.exports = IntegrityValidator;
