function BaseHttpError(reasonPhrase, message, statusCode){
    this.reasonPhrase = reasonPhrase || '';
    this.message = message || '';
    this.statusCode = statusCode || 500;
}

module.exports = BaseHttpError;