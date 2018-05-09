const IntegrityValidator = require('../../src/utils/integrity_validator.js');

function ServerModel(logger, postgrePool) {
  let _logger = logger;
  let _postgrePool = postgrePool;
  let integrityValidator = new IntegrityValidator(logger);

  function getBusinessServer(dbServer) {
    return {
      id: dbServer.server_id,
      name: dbServer.server_name,
      _rev: dbServer._rev,
    };
  };

  function findByServerNameReturnAllParams(serverName, callback) {
    let query = 'SELECT server_id, server_name, _rev FROM servers WHERE server_name = $1;';
    let values = [serverName];
    executeQuery(query, values, function(err, res) {
      if (err) {
        _logger.error('Error looking for server name:\'%s\' in the database', serverName);
        callback(err);
      } else if (res.rows.length == 0) {
        _logger.info('Server with name:\'%s\' not found', serverName);
        callback('Server not found');
      } else if (res.rows.length > 1) {
        _logger.warn('More than a server found for name: %s');
      } else {
        _logger.info('Server with name:\'%s\' found', serverName);
        callback(null, res.rows[0]);
      }
    });
  }

  this.findByServerName = function(serverName, callback) {
    findByServerNameReturnAllParams(serverName, function(err, dbServer) {
      if (err) callback(err);
      else {
        callback(null, getBusinessServer(dbServer));
      }
    });
  };

  function updateServerRev(serverName, rev, callback) {
    let query = 'UPDATE servers SET _rev=$1 WHERE server_name=$2 RETURNING server_id, server_name, _rev;';
    let values = [rev, serverName];
    executeQuery(query, values, function(err, res) {
      if (err) {
        _logger.error('Error updating rev for server name:\'%s\'', serverName);
        callback(err);
      } else {
        _logger.info('Hash for server: \'%s\' updated successfully', serverName);
        callback(null, getBusinessServer(res.rows[0]));
      }
    });
  };


  this.create = function(server, callback) {
    let query = 'INSERT INTO servers(server_name) VALUES ($1) RETURNING server_id, server_name;';
    let values = [server.name];
    executeQuery(query, values, function(err, res) {
      if (err) {
        _logger.error('Error creating server with name:\'%s\' to database', server.name);
        callback(err);
      } else {
        _logger.info('Server with name: \'%s\' created successfully', server.name);
        _logger.debug('Server created in db: %j', res.rows[0]);
        // integrity hash is created here since we now know the user_id
        let rev = integrityValidator.createHash(server);
        updateServerRev(server.name, rev, callback);
      }
    });
  };

  function executeUpdate(server, callback) {
    let currentRev = integrityValidator.createHash(server);
    let query = 'UPDATE servers SET _rev=$1 WHERE server_name=$2 RETURNING server_id, server_name;';
    let values = [currentRev, server.name];
    executeQuery(query, values, function(err, res) {
      if (err) {
        _logger.error('Error updating server with name:\'%s\' to database', server.name);
        callback(err);
      } else {
        _logger.info('Server with name: \'%s\' updated successfully', server.name);
        _logger.debug('Server updated in db: %j', res.rows[0]);
        callback(null, getBusinessServer(res.rows[0]));
      }
    });
  };

  this.update = function(server, callback) {
    this.findByServerName(server.name, function(err, dbServer) {
      if (err) callback(err);
      else {
        if (dbServer._rev === server._rev) {
          _logger.info('The integrity check for server with name: \'%s\' was successful. Proceeding with update.', server.name);
          executeUpdate(server, callback);
        } else {
          _logger.error('The integrity check for server with name: \'%s\' failed. Aborting update.', server.name);
          callback('Error updating');
        }
      }
    });
  };

  function executeQuery(query, values, callback) {
    _postgrePool.query(query, values, function(err, res) {
      if (err) {
        _logger.error('DB error: %j', err);
        return callback(err);
      } else {
        _logger.debug('Postgre response: %j', res);
        return callback(null, res);
      }
    });
  }
}

module.exports = ServerModel;
