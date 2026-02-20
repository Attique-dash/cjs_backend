const app = require('../dist/app');

module.exports = async (req, res) => {
  // Handle all requests with the Express app
  app(req, res);
};
