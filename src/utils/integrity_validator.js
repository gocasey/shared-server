const hash = require('object-hash');

function IntegrityValidator() {
  function hashOptions() {
    return {
      algorithm: 'md5', encoding: 'base64', excludeKeys: function(key) {
        if (key === 'rev') return true;
        return false;
      },
    };
  }

  this.createHash = function(object) {
    return hash(object, hashOptions());
  };

  this.validateHash = function(object, hash) {
    let objectHash = this.createHash(object);
    return objectHash === hash;
  };
}

module.exports = IntegrityValidator;
