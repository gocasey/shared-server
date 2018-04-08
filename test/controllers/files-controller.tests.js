const filesController = require('../../src/controllers/files-controller');

describe('filesController unit tests', () => {
  let req;
  let res;
  let result;

  beforeEach(() => {
    req = {};
    res = { send: sinon.stub() };
  });

  describe('#getFiles', () => {
    beforeEach(() => {
      result = 'Hit GET files';
      filesController.getFiles(req, res);
    });

    it('should send the files', () => res.send.should.have.been.calledWith(result));
  });
});
