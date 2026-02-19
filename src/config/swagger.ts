import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Warehouse Management API',
      version: '1.0.0',
      description: 'A comprehensive warehouse management system API with interactive documentation',
      contact: {
        name: 'API Support',
        email: 'support@warehouse.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from login endpoint'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for warehouse integration'
        }
      },
      schemas: {
        // User Schema
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            userCode: { 
              type: 'string', 
              description: 'User code in format CLEAN-XXXX (same as mailbox number)',
              example: 'CLEAN-0001'
            },
            firstName: { 
              type: 'string', 
              description: 'User first name',
              example: 'John'
            },
            lastName: { 
              type: 'string', 
              description: 'User last name',
              example: 'Doe'
            },
            email: { 
              type: 'string', 
              format: 'email', 
              description: 'User email',
              example: 'john.doe@example.com'
            },
            password: { 
              type: 'string', 
              minLength: 8, 
              description: 'User password (will be hashed)',
              example: 'password123'
            },
            phone: { 
              type: 'string', 
              description: 'User phone number',
              example: '+1234567890'
            },
            role: { 
              type: 'string', 
              enum: ['admin', 'customer', 'warehouse'], 
              description: 'User role (admin users are created via seeding only)',
              example: 'customer'
            },
            mailboxNumber: {
              type: 'string',
              description: 'Customer mailbox number (same as userCode)',
              example: 'CLEAN-0001'
            },
            address: {
              type: 'object',
              description: 'Customer address',
              properties: {
                street: {
                  type: 'string',
                  description: 'Street address',
                  example: '123 Main St'
                },
                city: {
                  type: 'string',
                  description: 'City',
                  example: 'New York'
                },
                state: {
                  type: 'string',
                  description: 'State',
                  example: 'NY'
                },
                zipCode: {
                  type: 'string',
                  description: 'ZIP code',
                  example: '10001'
                },
                country: {
                  type: 'string',
                  description: 'Country',
                  example: 'USA'
                }
              }
            },
            accountStatus: { 
              type: 'string', 
              enum: ['pending', 'active', 'inactive'], 
              description: 'Account status',
              example: 'active'
            },
            emailVerified: { 
              type: 'boolean', 
              description: 'Email verification status',
              example: true
            }
          }
        },
        
        // Login Schema
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email', 
              description: 'User email',
              example: 'alice@customer.com'
            },
            password: { 
              type: 'string', 
              description: 'User password',
              example: 'customer123'
            }
          }
        },
        
        // Register Schema
        Register: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: { 
              type: 'string',
              example: 'John'
            },
            lastName: { 
              type: 'string',
              example: 'Doe'
            },
            email: { 
              type: 'string', 
              format: 'email',
              example: 'john@example.com'
            },
            password: { 
              type: 'string', 
              minLength: 8,
              example: 'password123'
            },
            phone: { 
              type: 'string',
              example: '+1234567890'
            },
            role: {
              type: 'string',
              enum: ['customer', 'warehouse'],
              description: 'User role (admin registration not allowed)',
              example: 'customer'
            },
            address: {
              type: 'object',
              description: 'User address (optional)',
              properties: {
                street: {
                  type: 'string',
                  description: 'Street address',
                  example: '123 Main St'
                },
                city: {
                  type: 'string',
                  description: 'City',
                  example: 'New York'
                },
                state: {
                  type: 'string',
                  description: 'State/Province',
                  example: 'NY'
                },
                zipCode: {
                  type: 'string',
                  description: 'ZIP/Postal code',
                  example: '10001'
                },
                country: {
                  type: 'string',
                  description: 'Country',
                  example: 'USA'
                }
              }
            }
          }
        },
        
        // Package Schema
        Package: {
          type: 'object',
          required: ['trackingNumber', 'userCode', 'userId', 'weight'],
          properties: {
            trackingNumber: { 
              type: 'string', 
              description: 'Package tracking number',
              example: 'TRK123456789'
            },
            userCode: { 
              type: 'string', 
              description: 'User code',
              example: 'CLEAN-0001'
            },
            userId: { 
              type: 'string', 
              description: 'User ID',
              example: '507f1f77bcf86cd799439011'
            },
            weight: { 
              type: 'number', 
              description: 'Package weight in kg',
              example: 5.5
            },
            dimensions: { 
              type: 'object', 
              properties: {
                length: { type: 'number', example: 10 },
                width: { type: 'number', example: 8 },
                height: { type: 'number', example: 5 },
                unit: { type: 'string', enum: ['cm', 'in'], example: 'cm' }
              },
              description: 'Package dimensions'
            },
            serviceMode: { 
              type: 'string', 
              enum: ['air', 'ocean', 'local'], 
              description: 'Service mode',
              example: 'air'
            },
            status: { 
              type: 'string', 
              enum: ['received', 'in_transit', 'out_for_delivery', 'delivered', 'pending', 'customs', 'returned'], 
              description: 'Package status',
              example: 'received'
            },
            shipper: { 
              type: 'string', 
              description: 'Shipper name',
              example: 'DHL'
            },
            description: { 
              type: 'string', 
              description: 'Package description',
              example: 'Electronics package'
            }
          }
        },
        
        // API Response Schema
        ApiResponse: {
          type: 'object',
          properties: {
            success: { 
              type: 'boolean', 
              description: 'Request success status',
              example: true
            },
            message: { 
              type: 'string', 
              description: 'Response message',
              example: 'Operation successful'
            },
            data: { 
              type: 'object', 
              description: 'Response data'
            },
            error: { 
              type: 'string', 
              description: 'Error message if any'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp'
            }
          }
        },
        
        // Warehouse Schema
        Warehouse: {
          type: 'object',
          required: ['name', 'code', 'address'],
          properties: {
            name: { 
              type: 'string', 
              description: 'Warehouse name',
              example: 'Main Warehouse'
            },
            code: { 
              type: 'string', 
              description: 'Warehouse code',
              example: 'WH-001'
            },
            address: {
              type: 'object',
              description: 'Warehouse address',
              properties: {
                street: {
                  type: 'string',
                  example: '123 Storage Lane'
                },
                city: {
                  type: 'string',
                  example: 'Newark'
                },
                state: {
                  type: 'string',
                  example: 'NJ'
                },
                zipCode: {
                  type: 'string',
                  example: '07102'
                },
                country: {
                  type: 'string',
                  example: 'USA'
                }
              }
            },
            isActive: { 
              type: 'boolean', 
              description: 'Warehouse active status',
              example: true
            },
            capacity: { 
              type: 'number', 
              description: 'Warehouse capacity',
              example: 10000
            }
          }
        },
        
        // Error Response Schema
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { 
              type: 'boolean', 
              example: false
            },
            message: { 
              type: 'string',
              example: 'An error occurred'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Admin',
        description: 'Admin-only management endpoints'
      },
      {
        name: 'Warehouse',
        description: 'Warehouse management endpoints'
      },
      {
        name: 'Customer',
        description: 'Customer-facing endpoints'
      },
      {
        name: 'Packages',
        description: 'Package management'
      },
      {
        name: 'Health',
        description: 'API health check'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/**/*.ts',
    './src/controllers/*.ts',
    './src/controllers/**/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

// Custom Swagger UI options for better testing experience
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true, // Keep authorization after page refresh
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    docExpansion: 'list', // 'list' | 'full' | 'none'
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
  customSiteTitle: 'Warehouse API Documentation',
  customfavIcon: '/favicon.ico'
};

export { swaggerUi, specs, swaggerUiOptions };
