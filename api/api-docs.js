const { specs } = require('../dist/config/swagger');

module.exports = async (req, res) => {
  // Serve Swagger JSON spec
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
};
