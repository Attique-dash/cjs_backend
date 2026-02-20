const swaggerUi = require('swagger-ui-express');
const { specs } = require('../dist/config/swagger');

module.exports = async (req, res) => {
  // Create Express app instance
  const express = require('express');
  const app = express();
  
  // Serve Swagger UI at root
  app.use('/', swaggerUi.serve);
  app.get('/', swaggerUi.setup(specs, {
    explorer: true,
    swaggerOptions: {
      url: '/api-docs',
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      docExpansion: 'list',
      operationsSorter: 'alpha',
      tagsSorter: 'alpha'
    },
    customCss: `
      .swagger-ui .topbar { 
        background-color: #2c3e50;
      }
      .swagger-ui .info .title {
        color: #2c3e50;
      }
      .swagger-ui .btn.authorize {
        background-color: #27ae60;
        border-color: #27ae60;
      }
      .swagger-ui .btn.execute {
        background-color: #3498db;
        border-color: #3498db;
      }
    `,
    customSiteTitle: 'Warehouse API Documentation'
  }));
  
  // Handle the request
  app(req, res);
};
