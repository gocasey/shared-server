const pjson = require('../../../package.json');

function TokenResponseBuilder(logger) {
    let _logger = logger;

    this.buildResponse = function(req, res) {
        let user = res.data;

        let response = getBasicResponse();
        response.metadata.version = pjson.version;
        response.token.expiresAt = user.tokenExpiration;
        response.token.token = user.token;

        _logger.debug('Response: %j', response);
        res.json(response);
    };

    function getBasicResponse() {
        return {
            metadata: {
                version: '',
            },
            token: {
                expiresAt: 0,
                token: '',
            },
        };
    }
}

module.exports = TokenResponseBuilder;
