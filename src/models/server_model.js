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
      createdBy: dbServer.created_by,
      createdTime: dbServer.created_time,
      lastConnection: dbServer.last_connection,
      url: dbServer.url,
    };
  };

  async function findByServerNameReturnAllParams(serverName) {
    let query = 'SELECT server_id, server_name, _rev, created_by, created_time, last_connection, url FROM servers ' +
      'WHERE server_name = $1 AND is_active=TRUE;';
    let values = [serverName];
    try {
      let res = await executeQuery(query, values);
      if (res.rows.length == 0) {
        _logger.info('Server with name:\'%s\' not found', serverName);
        return;
      } else {
        _logger.info('Server with name:\'%s\' found', serverName);
        return res.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for server name:\'%s\' in the database', serverName);
      throw err;
    }
  }

  async function findByServerIdReturnAllParams(serverId) {
    let query = 'SELECT server_id, server_name, _rev, created_by, created_time, last_connection, url FROM servers ' +
      'WHERE server_id = $1 AND is_active=TRUE;';
    let values = [serverId];
    try {
      let res = await executeQuery(query, values);
      if (res.rows.length == 0) {
        _logger.info('Server with id:\'%s\' not found', serverId);
        return;
      } else {
        _logger.info('Server with id:\'%s\' found', serverId);
        return res.rows[0];
      }
    } catch (err) {
      _logger.error('Error looking for server id:\'%s\' in the database', serverId);
      throw err;
    }
  }

  this.findByServerName = async (serverName) => {
    let dbServer = await findByServerNameReturnAllParams(serverName);
    return dbServer ? getBusinessServer(dbServer) : null;
  };

  this.findByServerId = async (serverId) => {
    let dbServer = await findByServerIdReturnAllParams(serverId);
    return dbServer ? getBusinessServer(dbServer) : null;
  };

  this.getAllServers = async () => {
    let query = 'SELECT server_id, server_name, _rev, created_by, created_time, last_connection, url FROM servers ' +
      'WHERE is_active=TRUE;';
    try {
      let res = await executeQuery(query);
      if (res.rows.length == 0) {
        _logger.info('There are no servers created');
        return [];
      } else {
        _logger.info('Servers retrieved: %j', res.rows);
        return res.rows.map( (server) => {
 return getBusinessServer(server);
} );
      }
    } catch (err) {
      _logger.error('Error retrieving the servers from the database');
      throw err;
    }
  };

  this.updateLastConnection = async (server) => {
    let query = 'UPDATE servers SET last_connection=NOW() ' +
      'WHERE server_id=$1 and is_active=TRUE RETURNING server_id, server_name, _rev, created_by, created_time, last_connection, url;';
    let values = [server.id];
    try {
      let res = await executeQuery(query, values);
      _logger.info('Last connection for server with name: \'%s\' updated successfully', server.name);
      _logger.debug('Last connection for server updated in db: %j', res.rows[0]);
      return getBusinessServer(res.rows[0]);
    } catch (err) {
      _logger.error('Error updating last connection for server with name:\'%s\' to database', server.name);
      throw err;
    }
  };

  async function updateServerRev(serverName, rev) {
    let query = 'UPDATE servers SET _rev=$1 WHERE server_name=$2 RETURNING server_id, server_name, _rev, created_by, created_time, last_connection, url;';
    let values = [rev, serverName];
    try {
      let res = await executeQuery(query, values);
      _logger.info('Hash for server: \'%s\' updated successfully', serverName);
      return getBusinessServer(res.rows[0]);
    } catch (err) {
      _logger.error('Error updating rev for server name:\'%s\'', serverName);
      throw err;
    }
  };

  this.create = async (server) => {
    let query = 'INSERT INTO servers(server_name, created_by, url) VALUES ($1, $2, $3) ' +
      'RETURNING server_id, server_name, created_by, created_time, last_connection, url;';
    let values = [server.name, server.createdBy, server.url];
    let response;
    try {
      response = await executeQuery(query, values);
    } catch (err) {
      logger.error('Error creating server with name:\'%s\' to database', server.name);
      throw err;
    }
    _logger.info('Server with name: \'%s\' created successfully', server.name);
    _logger.debug('Server created in db: %j', response.rows[0]);
    // integrity hash is created here since we now know the user_id
    let rev = integrityValidator.createHash(response.rows[0]);
    return await updateServerRev(server.name, rev);
  };

  async function executeUpdate(server) {
    let currentRev = integrityValidator.createHash(server);
    let query = 'UPDATE servers SET server_name=$1, _rev=$2, url=$3 ' +
      'WHERE server_id=$4 AND is_active=TRUE RETURNING server_id, server_name, _rev, created_by, created_time, last_connection, url;';
    let values = [server.name, currentRev, server.url, server.id];
    try {
      let res = await executeQuery(query, values);
      _logger.info('Server with name: \'%s\' updated successfully', server.name);
      _logger.debug('Server updated in db: %j', res.rows[0]);
      return getBusinessServer(res.rows[0]);
    } catch (err) {
      _logger.error('Error updating server with name:\'%s\' to database', server.name);
      throw err;
    }
  };

  this.update = async (server) => {
    let dbServer = await findByServerIdReturnAllParams(server.id);
    if (dbServer) {
      if (dbServer._rev === server._rev) {
        _logger.info('The integrity check for server with name: \'%s\' was successful. Proceeding with update.', server.name);
        return await executeUpdate(server);
      } else {
        _logger.error('The integrity check for server with name: \'%s\' failed. Aborting update.', server.name);
        throw new Error('Integrity check error');
      }
    } else {
      _logger.error('Update cannot be completed, server with name: \'%s\' does not exist', server.name);
      throw new Error('Server does not exist');
    }
  };

  async function executeLogicDelete(serverId) {
    let query = 'UPDATE servers SET is_active=FALSE WHERE server_id=$1;';
    let values = [serverId];
    try {
      await executeQuery(query, values);
    } catch (err) {
      _logger.error('Error executing logic delete for server id:\'%s\'', serverId);
      throw err;
    }
    _logger.info('Logic delete for server id: \'%s\' executed successfully', serverId);
    return;
  };

  this.delete = async (serverId) => {
    let dbServer = await findByServerIdReturnAllParams(serverId);
    if (dbServer) {
      return await executeLogicDelete(serverId);
    } else {
      _logger.error('Delete cannot be completed, server with id: \'%s\' does not exist', serverId);
      throw new Error('Server does not exist');
    }
  };

  async function executeQuery(query, values) {
    const client = await _postgrePool.connect();
    try {
      let response = await client.query(query, values);
      _logger.debug('Postgre response: %j', response);
      return response;
    } catch (err) {
      _logger.error('DB error: %j', err.message);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = ServerModel;
