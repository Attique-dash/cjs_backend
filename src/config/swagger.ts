import swaggerJsdoc from 'swagger-jsdoc';

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
        url: 'https://cleanjshipping.vercel.app',
        description: 'Production server (Vercel)'
      },
      {
        url: 'https://cleanjshipping-p79g5utyy-muhammad-attiques-projects.vercel.app',
        description: 'Preview deployment (Vercel)'
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
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'USA' }
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
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'alice@customer.com' },
            password: { type: 'string', example: 'customer123' }
          }
        },
        Register: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 8, example: 'password123' },
            phone: { type: 'string', example: '+1234567890' },
            role: {
              type: 'string',
              enum: ['customer', 'warehouse'],
              description: 'User role (admin registration not allowed)',
              example: 'customer'
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'USA' }
              }
            }
          }
        },
        Package: {
          type: 'object',
          required: ['trackingNumber', 'userCode', 'userId', 'weight'],
          properties: {
            trackingNumber: { type: 'string', example: 'TRK123456789' },
            userCode: { type: 'string', example: 'CLEAN-0001' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            weight: { type: 'number', example: 5.5 },
            dimensions: {
              type: 'object',
              properties: {
                length: { type: 'number', example: 10 },
                width: { type: 'number', example: 8 },
                height: { type: 'number', example: 5 },
                unit: { type: 'string', enum: ['cm', 'in'], example: 'cm' }
              }
            },
            serviceMode: { type: 'string', enum: ['air', 'ocean', 'local'], example: 'air' },
            status: { 
              type: 'string', 
              enum: ['received', 'in_transit', 'out_for_delivery', 'delivered', 'pending', 'customs', 'returned'],
              example: 'received'
            },
            shipper: { type: 'string', example: 'DHL' },
            description: { type: 'string', example: 'Electronics package' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        Warehouse: {
          type: 'object',
          required: ['name', 'code', 'address'],
          properties: {
            name: { type: 'string', example: 'Main Warehouse' },
            code: { type: 'string', example: 'WH-001' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Storage Lane' },
                city: { type: 'string', example: 'Newark' },
                state: { type: 'string', example: 'NJ' },
                zipCode: { type: 'string', example: '07102' },
                country: { type: 'string', example: 'USA' }
              }
            },
            isActive: { type: 'boolean', example: true },
            capacity: { type: 'number', example: 10000 }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Admin', description: 'Admin-only management endpoints' },
      { name: 'Warehouse', description: 'Warehouse management endpoints' },
      { name: 'Customer', description: 'Customer-facing endpoints' },
      { name: 'Packages', description: 'Package management' },
      { name: 'Health', description: 'API health check' }
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

export { specs };