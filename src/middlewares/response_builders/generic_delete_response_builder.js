function GenericDeleteResponseBuilder() {

  this.buildResponse = function(req, res) {
    res.status(204).send();
  };
}

module.exports = GenericDeleteResponseBuilder;
