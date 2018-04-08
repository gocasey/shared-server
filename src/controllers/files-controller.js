async function getFiles(req, res) {
  res.send('Hit GET files');
}

async function createFiles(req, res) {
  res.send('Hit POST files');
}

async function getFile(req, res) {
  res.send('Hit GET files/' + req.params.fileId);
}

async function updateFile(req, res) {
  res.send('Hit PUT files/' + req.params.fileId);
}

async function deleteFile(req, res) {
  res.send('Hit DELETE files/' + req.params.fileId);
}

async function uploadFiles(req, res) {
  res.send('Hit POST files/upload');
}

module.exports = {
  getFiles,
  createFiles,
  getFile,
  updateFile,
  deleteFile,
  uploadFiles,
};

