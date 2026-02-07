import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Warehouse Management API',
      version: '1.0.0',
      description: 'A comprehensive warehouse management system API',
      contact: {
        name: 'API Support',
        email: 'support@warehouse.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', description: 'User full name' },
            email: { type: 'string', format: 'email', description: 'User email' },
            password: { type: 'string', minLength: 6, description: 'User password' },
            role: { type: 'string', enum: ['admin', 'staff', 'customer'], description: 'User role' }
          }
        },
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', description: 'User email' },
            password: { type: 'string', description: 'User password' }
          }
        },
        Warehouse: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Warehouse name' },
            location: { type: 'string', description: 'Warehouse location' },
            capacity: { type: 'number', description: 'Warehouse capacity' },
            isActive: { type: 'boolean', description: 'Warehouse status' }
          }
        },
        Package: {
          type: 'object',
          properties: {
            trackingNumber: { type: 'string', description: 'Package tracking number' },
            status: { type: 'string', enum: ['pending', 'in_transit', 'delivered', 'cancelled'], description: 'Package status' },
            weight: { type: 'number', description: 'Package weight' },
            dimensions: { type: 'object', description: 'Package dimensions' },
            sender: { type: 'string', description: 'Sender information' },
            recipient: { type: 'string', description: 'Recipient information' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Request success status' },
            message: { type: 'string', description: 'Response message' },
            data: { type: 'object', description: 'Response data' },
            error: { type: 'string', description: 'Error message if any' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/routes/**/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
