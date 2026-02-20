const swaggerUi = require('swagger-ui-express');
const { specs } = require('../dist/config/swagger');

module.exports = async (req, res) => {
  // Create Express app instance
  const express = require('express');
  const app = express();
  
  // Serve Swagger UI at root with minimal configuration
  app.get('/', swaggerUi.setup(specs));
  
  // Handle the request
  app(req, res);
};
