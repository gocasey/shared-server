var pjson = require('../../../package.json');

function TokenResponseBuilder(logger){

    var _logger = logger;

    this.buildResponse = function(req, res){
        var user = res.data;

        var response = getBasicResponse();
        response.metadata.version = pjson.version;
        response.token.expiresAt = user.token.expiresAt;
        response.token.token = user.token.token;

        _logger.debug('Response: %j', response);
        res.json(response);
    };

    function getBasicResponse(){
        return {
            metadata: {
                version: ''
            },
            token: {
                expiresAt: 0,
                token: ''
            }
        };
    }
}

module.exports = TokenResponseBuilder;
