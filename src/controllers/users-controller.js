async function generateToken(req, res) {
  res.send('Hit POST token');
}

async function authorizeUser(req, res) {
  res.send('Hit POST authorize');
}

module.exports = {
  generateToken,
  authorizeUser,
};
