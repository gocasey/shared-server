const pjson = require('../../../package.json');
const BaseHttpError = require('../../errors/base_http_error.js');

function UserStatsResponseBuilder(logger) {
  let _logger = logger;

  this.buildResponse = function(req, res, next) {
    let totalUsersCountByServer = res.totalUsersCountByServer;
    let activeUsersCountByServer = res.activeUsersCountByServer;

    let response = getServersStatsResponse();
    response.metadata.version = pjson.version;

    _logger.debug('Total users count by server: %j', totalUsersCountByServer);
    _logger.debug('Active users count by server: %j', activeUsersCountByServer);

    if (totalUsersCountByServer.length != activeUsersCountByServer.length) {
      _logger.error('The stats were not created correctly');
      let error = new BaseHttpError(500, 'Stats error');
      return next(error);
    }

    for (let i = 0; i < totalUsersCountByServer.length; i++) {
      let serverStatsResponse = getSingleServerStatsResponse();
      let singleServerTotalCount = totalUsersCountByServer[i];
      let singleServerActiveCount = activeUsersCountByServer[i];
      if (singleServerTotalCount.server_id != singleServerActiveCount.server_id) {
        _logger.error('The stats were not created correctly');
        let error = new BaseHttpError(500, 'Stats error');
        return next(error);
      }
      serverStatsResponse.id = singleServerTotalCount.server_id;
      serverStatsResponse.total_users = singleServerTotalCount.count;
      serverStatsResponse.active_users = singleServerActiveCount.count;
      response.servers_stats.push(serverStatsResponse);
    }

    _logger.debug('Response: %j', response);
    res.status(200).json(response);
  };

  function getSingleServerStatsResponse() {
    return {
      id: '',
      total_users: '',
      active_users: '',
    };
  }

  function getServersStatsResponse() {
    return {
      metadata: {
        version: '',
      },
      servers_stats: [],
    };
  }
}

module.exports = UserStatsResponseBuilder;
