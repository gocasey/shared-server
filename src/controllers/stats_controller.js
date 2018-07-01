const request = require('request-promise-native');
const url = require('url');
const config = require('config');
const UserService = require('../lib/services/user_service.js');
const BaseHttpError = require('../errors/base_http_error.js');

function StatsController(logger, postgrePool) {
  let _logger = logger;
  let _userService = new UserService(logger, postgrePool);

  async function getSingleServerStats(server, statsApiEndpoint) {
    const options = getOptionsForServerCall(server, statsApiEndpoint);
    let appServerResponse;
    try {
      appServerResponse = await request.get(options);
    } catch (err) {
      _logger.error('Error sending request to app server');
      _logger.debug('Error sending request to app server: %s', err);
      throw new BaseHttpError(500, 'Error sending request to app server');
    }
    _logger.debug('App Server Response. Status Code: %s . Body: %s', appServerResponse.statusCode, appServerResponse.body);
    if (appServerResponse.statusCode < 200 || appServerResponse.statusCode >= 300) {
      _logger.error('Error returned from app server with server_id: %s', server.id);
      throw new BaseHttpError(500, 'Error returned from app server');
    }
    return appServerResponse.body;
  }

  function getSingleServerStatsResponse() {
    return {
      id: '',
      stats: [],
    };
  }

  function getOptionsForServerCall(server, statsApiEndpoint) {
    return {
      url: url.resolve(server.url, statsApiEndpoint),
      json: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {},
      forever: true,
      resolveWithFullResponse: true,
      timeout: 15000,
    };
  }

  async function getStatsCountByServer(req, res, next, statsApiEndpoint) {
    let servers = res.servers;
    let serversStats = await Promise.all(servers.map(async (server) => {
      let singleServerStatsResponse = getSingleServerStatsResponse();
      singleServerStatsResponse.id = server.id;
      let singleServerStats;
      try {
        singleServerStats = await getSingleServerStats(server, statsApiEndpoint);
      } catch (err) {
        _logger.error('Error returning stats from the app server: %j', err);
        singleServerStatsResponse.stats = [];
        return singleServerStatsResponse;
      }
      singleServerStatsResponse.stats = singleServerStats.stats;
      return singleServerStatsResponse;
    }));
    res.serversStats = serversStats;
    return next();
  }

  this.getStoriesByServer = async (req, res, next) => {
    let storiesEndpoint = config.APP_SERVER_ENDPOINT_FOR_STORIES_STATS;
    getStatsCountByServer(req, res, next, storiesEndpoint);
  };

  this.getRequestsByServer = async (req, res, next) => {
    let requestsEndpoint = config.APP_SERVER_ENDPOINT_FOR_REQUESTS_STATS;
    let minutesFilter = req.query.minutes || '60';
    getStatsCountByServer(req, res, next, url.resolve(requestsEndpoint, minutesFilter));
  };

  this.getTotalUsersCountByServer = async (req, res, next) => {
    let totalUsersCountByServer;
    try {
      totalUsersCountByServer = await _userService.getTotalUsersCountByServer();
    } catch (err) {
      return next(err);
    }
    res.totalUsersCountByServer = totalUsersCountByServer;
    return next();
  };

  this.getActiveUsersCountByServer = async (req, res, next) => {
    let activeUsersCountByServer;
    try {
      activeUsersCountByServer = await _userService.getActiveUsersCountByServer();
    } catch (err) {
      return next(err);
    }
    res.activeUsersCountByServer = activeUsersCountByServer;
    return next();
  };
}

module.exports = StatsController;
