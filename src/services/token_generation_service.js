var uuidAPIKey = require('uuid-apikey');

function TokenGenerationService(){

    this.generateToken = function(){
        var token = uuidAPIKey.create();
        var expirationDate = new Date.now();
        expirationDate.setHours(expirationDate.getHours() + 1);
        return{
            token : token,
            expireAt: expirationDate.getTime()
        }
    };
}

module.exports = TokenGenerationService;