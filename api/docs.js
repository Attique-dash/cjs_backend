const swaggerUi = require('swagger-ui-express');
const { specs } = require('../dist/config/swagger');

module.exports = async (req, res) => {
  try {
    // Set proper HTML content type
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Generate Swagger UI HTML with proper script and style references
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Warehouse API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css">
    <style>
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
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api-docs',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                validatorUrl: null,
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                tryItOutEnabled: true,
                defaultModelsExpandDepth: 3,
                defaultModelExpandDepth: 3,
                docExpansion: 'list',
                operationsSorter: 'alpha',
                tagsSorter: 'alpha'
            });
        }
    </script>
</body>
</html>
    `;
    
    res.status(200).send(html);
  } catch (error) {
    console.error('Error serving Swagger UI:', error);
    res.status(500).json({ error: 'Failed to load API documentation' });
  }
};
