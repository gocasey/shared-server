function TokenResponseBuilder(logger){

    var _logger = logger;

    this.buildResponse = function(req, res, next){
        var user = res.data;

        var response = getBasicResponse();
        response.metadata.version = '1.0.0';
        response.token.expiresAt = user.tokenExpirationDate;
        response.token.token = user.token;

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