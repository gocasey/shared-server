async function getServers(req, res) {
  res.send('Hit GET servers');
}

async function createServers(req, res) {
  res.send('Hit POST servers');
}

async function getServer(req, res) {
  res.send('Hit GET server/' + req.params.serverId);
}

async function createServer(req, res) {
  res.end('Hit POST servers/' + req.params.serverId);
}

async function updateServer(req, res) {
  res.end('Hit POST servers/' + req.params.serverId);
}

async function deleteServer(req, res) {
  res.end('Hit DELETE servers/' + req.params.serverId);
}

module.exports = {
  getServers,
  createServers,
  getServer,
  createServer,
  updateServer,
  deleteServer,
};
