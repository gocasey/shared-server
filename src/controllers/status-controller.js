
/**
 * Simple ping endpoint that returns 200.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
async function ping(req, res) {
  res.send();
}

module.exports = {
  ping,
};
