const pjson = require('../../../package.json');

function StatsResponseBuilder(logger) {
  let _logger = logger;

  this.buildResponse = function(req, res) {
    let statsByServer = res.serversStats;

    let response = getServersStatsResponse();
    response.metadata.version = pjson.version;
    response.servers_stats = statsByServer;

    _logger.debug('Response: %j', response);
    res.status(200).json(response);
  };

  function getServersStatsResponse() {
    return {
      metadata: {
        version: '',
      },
      servers_stats: [],
    };
  }
}

module.exports = StatsResponseBuilder;
