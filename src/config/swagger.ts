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
          required: ['firstName', 'lastName', 'email', 'passwordHash'],
          properties: {
            userCode: { type: 'string', description: 'User code in format XX-123' },
            firstName: { type: 'string', description: 'User first name' },
            lastName: { type: 'string', description: 'User last name' },
            email: { type: 'string', format: 'email', description: 'User email' },
            passwordHash: { type: 'string', minLength: 8, description: 'User password (will be hashed)' },
            phone: { type: 'string', description: 'User phone number' },
            role: { type: 'string', enum: ['admin', 'customer', 'warehouse'], description: 'User role' },
            accountStatus: { type: 'string', enum: ['pending', 'active', 'inactive'], description: 'Account status' },
            emailVerified: { type: 'boolean', description: 'Email verification status' }
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
          required: ['trackingNumber', 'userCode', 'userId', 'weight'],
          properties: {
            trackingNumber: { type: 'string', description: 'Package tracking number' },
            userCode: { type: 'string', description: 'User code' },
            userId: { type: 'string', description: 'User ID' },
            weight: { type: 'number', description: 'Package weight' },
            dimensions: { 
              type: 'object', 
              properties: {
                length: { type: 'number' },
                width: { type: 'number' },
                height: { type: 'number' },
                unit: { type: 'string', enum: ['cm', 'in'] }
              },
              description: 'Package dimensions' 
            },
            serviceMode: { type: 'string', enum: ['air', 'ocean', 'local'], description: 'Service mode' },
            status: { type: 'string', enum: ['received', 'in_transit', 'out_for_delivery', 'delivered', 'pending', 'customs', 'returned'], description: 'Package status' },
            shipper: { type: 'string', description: 'Shipper name' },
            description: { type: 'string', description: 'Package description' },
            itemDescription: { type: 'string', description: 'Item description' },
            senderName: { type: 'string', description: 'Sender name' },
            senderEmail: { type: 'string', format: 'email', description: 'Sender email' },
            senderPhone: { type: 'string', description: 'Sender phone' },
            senderAddress: { type: 'string', description: 'Sender address' },
            senderCountry: { type: 'string', description: 'Sender country' },
            recipient: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                shippingId: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' }
              },
              description: 'Recipient information'
            },
            warehouseLocation: { type: 'string', description: 'Warehouse location' },
            customsRequired: { type: 'boolean', description: 'Customs required' },
            customsStatus: { type: 'string', enum: ['not_required', 'pending', 'cleared'], description: 'Customs status' },
            shippingCost: { type: 'number', description: 'Shipping cost' },
            totalAmount: { type: 'number', description: 'Total amount' },
            paymentStatus: { type: 'string', enum: ['pending', 'paid', 'partially_paid'], description: 'Payment status' },
            isFragile: { type: 'boolean', description: 'Fragile package' },
            isHazardous: { type: 'boolean', description: 'Hazardous package' },
            requiresSignature: { type: 'boolean', description: 'Signature required' },
            specialInstructions: { type: 'string', description: 'Special instructions' }
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
