import swaggerJsdoc from 'swagger-jsdoc';

const getServers = () => {
  const servers = [];
  
  if (process.env.NODE_ENV === 'production') {
    servers.push({
      url: process.env.BASE_URL || 'https://cleanjshipping.vercel.app',
      description: 'Production server'
    });
  } else {
    servers.push({
      url: `http://localhost:${process.env.PORT || 5000}`,
      description: 'Development server'
    });
  }
  
  return servers;
};

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
    servers: getServers(),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from login endpoint (for Customer, Warehouse, Admin roles)'
        },
        kcdBearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your KCD API Bearer token (for KCD endpoints only)'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for warehouse integration'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            userCode: { type: 'string', example: 'CLEAN-0001' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', minLength: 8, example: 'password123' },
            phone: { type: 'string', example: '+1234567890' },
            role: { type: 'string', enum: ['admin', 'customer', 'warehouse'], example: 'customer' },
            mailboxNumber: { type: 'string', example: 'CLEAN-0001' },
            accountStatus: { type: 'string', enum: ['pending', 'active', 'inactive'], example: 'active' },
            emailVerified: { type: 'boolean', example: true }
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
            role: { type: 'string', enum: ['customer', 'warehouse'], example: 'customer' }
          }
        },
        Package: {
          type: 'object',
          properties: {
            trackingNumber: { type: 'string', example: 'TRK123456789' },
            userCode: { type: 'string', example: 'CLEAN-0001' },
            weight: { type: 'number', example: 5.5 },
            serviceMode: { type: 'string', enum: ['air', 'ocean', 'local'], example: 'air' },
            status: { type: 'string', enum: ['received', 'in_transit', 'out_for_delivery', 'delivered', 'pending', 'customs', 'returned'], example: 'received' },
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
            timestamp: { type: 'string', format: 'date-time' }
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
      { name: 'Admin API Keys', description: 'API key management for KCD integration' },
      { name: 'Warehouse', description: 'Warehouse management endpoints' },
      { name: 'Customer', description: 'Customer-facing endpoints' },
      { name: 'KCD API', description: 'KCD Logistics integration endpoints' },
      { name: 'Health', description: 'API health check' }
    ],
    paths: {
      // ─── HEALTH ───────────────────────────────────────────────────────────
      '/health': {
        get: {
          summary: 'Server health check',
          tags: ['Health'],
          security: [],
          responses: {
            200: {
              description: 'Server is running',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
            }
          }
        }
      },
      '/api/health': {
        get: {
          summary: 'API health check',
          tags: ['Health'],
          security: [],
          responses: {
            200: {
              description: 'API is running',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
            }
          }
        }
      },

      // ─── AUTHENTICATION ───────────────────────────────────────────────────
      '/api/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Authentication'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Register' },
                example: {
                  firstName: 'John', lastName: 'Doe',
                  email: 'john@example.com', password: 'Password123!',
                  phone: '+1234567890', role: 'customer'
                }
              }
            }
          },
          responses: {
            201: { description: 'User registered successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            400: { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Login (all roles)',
          tags: ['Authentication'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Login' },
                example: { email: 'user@example.com', password: 'Password123!' }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  example: {
                    success: true, message: 'Login successful',
                    data: { token: 'eyJhbGci...', user: { id: '...', email: 'user@example.com', role: 'customer', userCode: 'CLEAN-0001' } }
                  }
                }
              }
            },
            401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ─── ADMIN ────────────────────────────────────────────────────────────
      '/api/admin/customers': {
        get: {
          summary: 'Get all customers',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
            { in: 'query', name: 'q', schema: { type: 'string' }, description: 'Search by name, email or user code' }
          ],
          responses: {
            200: { description: 'Customers retrieved successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/staff': {
        get: {
          summary: 'Get all warehouse staff',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
            { in: 'query', name: 'q', schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Staff retrieved successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        post: {
          summary: 'Add new warehouse staff',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'password'],
                  properties: {
                    firstName: { type: 'string', example: 'Jane' },
                    lastName: { type: 'string', example: 'Smith' },
                    email: { type: 'string', format: 'email', example: 'jane@warehouse.com' },
                    password: { type: 'string', example: 'SecurePass123!' },
                    phone: { type: 'string', example: '+1234567890' },
                    permissions: { type: 'array', items: { type: 'string' }, example: ['inventory_management'] }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Staff created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            409: { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/packages': {
        get: {
          summary: 'Get all packages',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['received', 'in_transit', 'delivered', 'pending', 'customs', 'returned'] } },
            { in: 'query', name: 'q', schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Packages retrieved successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/inventory': {
        get: {
          summary: 'Get all inventory',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
            { in: 'query', name: 'category', schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Inventory retrieved successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/stats': {
        get: {
          summary: 'Get system statistics',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Statistics retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      users: { total: 150, customers: 130, staff: 20 },
                      packages: { total: 500, pending: 45, delivered: 400 },
                      inventory: { total: 300, lowStock: 12 }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/users/{userCode}/role': {
        put: {
          summary: 'Change user role',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'userCode', required: true, schema: { type: 'string' }, example: 'CLEAN-0001' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object', required: ['role'],
                  properties: { role: { type: 'string', enum: ['admin', 'customer', 'warehouse'] } }
                },
                example: { role: 'warehouse' }
              }
            }
          },
          responses: {
            200: { description: 'Role updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/users/{userCode}/status': {
        put: {
          summary: 'Update user account status',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'userCode', required: true, schema: { type: 'string' }, example: 'CLEAN-0001' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { accountStatus: 'active', emailVerified: true }
              }
            }
          },
          responses: {
            200: { description: 'Status updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/users/{userCode}': {
        delete: {
          summary: 'Delete user',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'userCode', required: true, schema: { type: 'string' }, example: 'CLEAN-0001' }],
          responses: {
            200: { description: 'User deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/shipping-addresses': {
        get: {
          summary: 'Get all shipping addresses',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'type', schema: { type: 'string', enum: ['air', 'sea', 'china', 'standard'] } }
          ],
          responses: {
            200: { description: 'Shipping addresses retrieved successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },
      '/api/admin/shipping-address/{type}': {
        put: {
          summary: 'Update shipping address by type',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'type', required: true, schema: { type: 'string', enum: ['air', 'sea', 'china', 'standard'] } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { address: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90001', country: 'USA' } }
              }
            }
          },
          responses: {
            200: { description: 'Address updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },

      // ─── WAREHOUSE PACKAGES ───────────────────────────────────────────────
      '/api/warehouse/packages': {
        get: {
          summary: 'Get all packages',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['received', 'in_transit', 'delivered', 'pending'] } },
            { in: 'query', name: 'userCode', schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Packages retrieved successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/warehouse/packages/search': {
        get: {
          summary: 'Search packages',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'q', schema: { type: 'string' }, description: 'Search by tracking number, name, etc.' },
            { in: 'query', name: 'userCode', schema: { type: 'string' } },
            { in: 'query', name: 'statuses', schema: { type: 'string' }, description: 'Comma-separated statuses' },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 50 } }
          ],
          responses: {
            200: { description: 'Search results', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },
      '/api/warehouse/packages/add': {
        post: {
          summary: 'Add new package',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Package' },
                example: {
                  trackingNumber: 'TRK123456789',
                  userCode: 'CLEAN-0001',
                  weight: 2.5,
                  serviceMode: 'air',
                  shipper: 'Amazon',
                  description: 'Electronics'
                }
              }
            }
          },
          responses: {
            201: { description: 'Package created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            400: { description: 'Invalid data', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'Tracking number already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/warehouse/packages/bulk-upload': {
        post: {
          summary: 'Bulk upload packages',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  packages: [
                    { trackingNumber: 'TRK001', userCode: 'CLEAN-0001', weight: 1.5, serviceMode: 'air' }
                  ]
                }
              }
            }
          },
          responses: {
            200: { description: 'Bulk upload result', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },
      '/api/warehouse/packages/{id}': {
        get: {
          summary: 'Get package by ID',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Package details', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'Package not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        put: {
          summary: 'Update package',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { example: { weight: 3.0, warehouseLocation: 'New York, NY' } } }
          },
          responses: {
            200: { description: 'Package updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'Package not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        delete: {
          summary: 'Delete package',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Package deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'Package not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/warehouse/packages/{id}/status': {
        post: {
          summary: 'Update package status',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { status: 'out_for_delivery', location: 'New York, NY', description: 'Out for delivery' }
              }
            }
          },
          responses: {
            200: { description: 'Status updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'Package not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ─── WAREHOUSE CUSTOMERS ──────────────────────────────────────────────
      '/api/warehouse/customers': {
        get: {
          summary: 'Get all customers',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'q', schema: { type: 'string' } },
            { in: 'query', name: 'userCode', schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Customers list', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        },
        delete: {
          summary: 'Delete customer',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { example: { user_code: 'CLEAN-0001' } } }
          },
          responses: {
            200: { description: 'Customer deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/warehouse/customers/{userCode}': {
        get: {
          summary: 'Get customer by user code',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'userCode', required: true, schema: { type: 'string' }, example: 'CLEAN-0001' }],
          responses: {
            200: { description: 'Customer details', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ─── WAREHOUSE INVENTORY ──────────────────────────────────────────────
      '/api/warehouse/inventory': {
        get: {
          summary: 'Get inventory list',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
            { in: 'query', name: 'category', schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Inventory list', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        },
        post: {
          summary: 'Create inventory item',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { name: 'Item A', sku: 'SKU-001', category: 'Electronics', quantity: 100, unitPrice: 29.99, minStockLevel: 10, maxStockLevel: 500 }
              }
            }
          },
          responses: {
            201: { description: 'Item created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },
      '/api/warehouse/inventory/{id}': {
        get: {
          summary: 'Get inventory item',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Item details', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        },
        put: {
          summary: 'Update inventory item',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { example: { quantity: 150 } } } },
          responses: {
            200: { description: 'Item updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        },
        delete: {
          summary: 'Delete inventory item',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Item deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },

      // ─── WAREHOUSE ANALYTICS ─────────────────────────────────────────────
      '/api/warehouse/analytics/dashboard': {
        get: {
          summary: 'Get dashboard statistics',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Dashboard stats', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },
      '/api/warehouse/analytics/packages': {
        get: {
          summary: 'Get package analytics',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
            { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } }
          ],
          responses: {
            200: { description: 'Package analytics', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },
      '/api/warehouse/analytics/revenue': {
        get: {
          summary: 'Get revenue analytics',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Revenue analytics', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },

      // ─── WAREHOUSE SETTINGS ───────────────────────────────────────────────
      '/api/warehouse/settings/shipping-addresses': {
        get: {
          summary: 'Get shipping address config',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Shipping address config', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        },
        put: {
          summary: 'Update shipping addresses',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  airAddress: { name: 'Air Freight Co', street: '3200 NW 112th Ave', city: 'Doral', state: 'FL', zipCode: '33172', country: 'USA' }
                }
              }
            }
          },
          responses: {
            200: { description: 'Addresses updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },

      // ─── WAREHOUSE REPORTS ────────────────────────────────────────────────
      '/api/warehouse/reports/packages': {
        get: {
          summary: 'Generate package report',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
            { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } }
          ],
          responses: {
            200: { description: 'Package report', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },
      '/api/warehouse/reports/inventory': {
        get: {
          summary: 'Generate inventory report',
          tags: ['Warehouse'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Inventory report', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },

      // ─── CUSTOMER ─────────────────────────────────────────────────────────
      '/api/customer/packages': {
        get: {
          summary: "Get customer's packages",
          tags: ['Customer'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['received', 'in_transit', 'delivered', 'pending'] } }
          ],
          responses: {
            200: { description: 'Customer packages', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/customer/packages/{id}': {
        get: {
          summary: 'Get package by ID',
          tags: ['Customer'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Package details', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'Package not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/customer/packages/tracking/{trackingNumber}': {
        get: {
          summary: 'Track package by tracking number',
          tags: ['Customer'],
          security: [],
          parameters: [{ in: 'path', name: 'trackingNumber', required: true, schema: { type: 'string' }, example: 'TRK123456789' }],
          responses: {
            200: { description: 'Tracking info', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/customer/profile': {
        get: {
          summary: 'Get customer profile',
          tags: ['Customer'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Profile data', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        },
        put: {
          summary: 'Update customer profile',
          tags: ['Customer'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { example: { firstName: 'John', lastName: 'Smith', phone: '+1234567890' } } }
          },
          responses: {
            200: { description: 'Profile updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },
      '/api/customer/shipping-addresses': {
        get: {
          summary: 'Get warehouse shipping addresses',
          description: 'Returns Air, Sea, and China warehouse addresses for this customer',
          tags: ['Customer'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Shipping addresses', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },
      '/api/customer/shipping-addresses/{type}': {
        get: {
          summary: 'Get shipping address by type',
          tags: ['Customer'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'type', required: true, schema: { type: 'string', enum: ['air', 'sea', 'china'] } }],
          responses: {
            200: { description: 'Shipping address', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
          }
        }
      },

      // ─── ADMIN API KEYS ─────────────────────────────────────────────────
      '/api/admin/api-keys/kcd': {
        post: {
          summary: 'Create KCD API Key',
          description: 'Create a new API key for KCD Logistics webhook integration. WarehouseId is auto-resolved if not provided.',
          tags: ['Admin API Keys'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', default: 'KCD Logistics Webhook' },
                    permissions: { type: 'array', items: { type: 'string' }, default: ['kcd_webhook', 'webhook'] },
                    description: { type: 'string', default: 'API key for KCD Logistics packing system' },
                    warehouseId: { type: 'string', description: 'Warehouse ID (optional - auto-resolved if not provided)' }
                  }
                }
              }
            }
          },
          responses: {
            201: { 
              description: 'API key created successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: '✅ KCD API key generated. Copy the key NOW — it will NOT be shown again.',
                    data: {
                      id: '64a7b8c9d1e2f3g4h5i6j7k8',
                      key: 'kcd_abcdef1234567890abcdef1234567890abcdef1234567890',
                      name: 'KCD Logistics Webhook',
                      kcdPortalFields: {
                        apiAccessToken: 'kcd_abcdef1234567890abcdef1234567890abcdef1234567890',
                        getCustomers: 'http://localhost:5000/api/warehouse/customers',
                        addPackage: 'http://localhost:5000/api/warehouse/packages/add',
                        updatePackage: 'http://localhost:5000/api/warehouse/packages/:id',
                        deletePackage: 'http://localhost:5000/api/webhooks/kcd/package-deleted',
                        updateManifest: 'http://localhost:5000/api/webhooks/kcd/manifest-created'
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/api-keys': {
        get: {
          summary: 'List All API Keys',
          description: 'Retrieve all API keys (without exposing the actual keys)',
          tags: ['Admin API Keys'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'API keys retrieved successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/api-keys/{keyId}/deactivate': {
        put: {
          summary: 'Deactivate API Key',
          description: 'Deactivate an API key to revoke access',
          tags: ['Admin API Keys'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'keyId', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'API key deactivated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'API key not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/api-keys/{keyId}/activate': {
        put: {
          summary: 'Activate API Key',
          description: 'Reactivate a previously deactivated API key',
          tags: ['Admin API Keys'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'keyId', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'API key activated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'API key not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/api-keys/{keyId}': {
        delete: {
          summary: 'Delete API Key',
          description: 'Permanently delete an API key',
          tags: ['Admin API Keys'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'keyId', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'API key deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
            404: { description: 'API key not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/api-keys/kcd-info': {
        get: {
          summary: 'Get KCD portal connection info',
          description: 'Returns all URLs to paste into KCD portal Courier System API tab',
          tags: ['Admin API Keys'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { 
              description: 'Connection info with all endpoint URLs',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      hasActiveKey: true,
                      activeKeyCount: 1,
                      instruction: '✅ Active key exists. Regenerate via POST /api/admin/api-keys/kcd if you need value.',
                      kcdPortalFields: {
                        apiAccessToken: '✅ Key exists — regenerate via POST /api/admin/api-keys/kcd to get the value',
                        getCustomers: 'http://localhost:5000/api/kcd/customers',
                        addPackage: 'http://localhost:5000/api/kcd/packages/add',
                        updatePackage: 'http://localhost:5000/api/kcd/packages/update',
                        deletePackage: 'http://localhost:5000/api/webhooks/kcd/package-deleted',
                        updateManifest: 'http://localhost:5000/api/webhooks/kcd/manifest-created'
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ─── KCD API ───────────────────────────────────────────────────────────
      '/api/kcd/customers': {
        get: {
          summary: 'Get Customers for KCD Courier',
          description: 'Retrieve customers for authenticated courier. Requires KCD API key.',
          tags: ['KCD API'],
          security: [{ kcdBearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'courierCode', schema: { type: 'string' }, description: 'Filter by courier code (optional)' },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 50 }, description: 'Number of results to return' },
            { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 }, description: 'Number of results to skip' }
          ],
          responses: {
            200: {
              description: 'Customers retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      customers: [
                        {
                          id: '64a7b8c9d1e2f3g4h5i6j7k8',
                          userCode: 'User123',
                          name: 'John Doe',
                          email: 'john@example.com',
                          phone: '+1234567890',
                          address: '123 Main St',
                          mailboxNumber: 'CLEAN-0001',
                          shippingAddresses: [],
                          courierCode: 'CLEAN'
                        }
                      ],
                      pagination: {
                        total: 1,
                        limit: 50,
                        offset: 0,
                        hasMore: false
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized - Invalid or missing API key', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      }
    },
    '/api/admin/api-keys': {
      get: {
        summary: 'List All API Keys',
        description: 'Retrieve all API keys (without exposing the actual keys)',
        tags: ['Admin API Keys'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'API keys retrieved successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/admin/api-keys/{keyId}/deactivate': {
      put: {
        summary: 'Deactivate API Key',
        description: 'Deactivate an API key to revoke access',
        tags: ['Admin API Keys'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'keyId', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'API key deactivated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          404: { description: 'API key not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/admin/api-keys/{keyId}/activate': {
      put: {
        summary: 'Activate API Key',
        description: 'Reactivate a previously deactivated API key',
        tags: ['Admin API Keys'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'keyId', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'API key activated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          404: { description: 'API key not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/admin/api-keys/{keyId}': {
      delete: {
        summary: 'Delete API Key',
        description: 'Permanently delete an API key',
        tags: ['Admin API Keys'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'keyId', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'API key deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          404: { description: 'API key not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/admin/api-keys/kcd-info': {
      get: {
        summary: 'Get KCD portal connection info',
        description: 'Returns all URLs to paste into KCD portal Courier System API tab',
        tags: ['Admin API Keys'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { 
            description: 'Connection info with all endpoint URLs',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    hasActiveKey: true,
                    activeKeyCount: 1,
                    instruction: '✅ Active key exists. Regenerate via POST /api/admin/api-keys/kcd if you need value.',
                    kcdPortalFields: {
                      apiAccessToken: '✅ Key exists — regenerate via POST /api/admin/api-keys/kcd to get the value',
                      getCustomers: 'http://localhost:5000/api/kcd/customers',
                      addPackage: 'http://localhost:5000/api/kcd/packages/add',
                      updatePackage: 'http://localhost:5000/api/kcd/packages/update',
                      deletePackage: 'http://localhost:5000/api/webhooks/kcd/package-deleted',
                      updateManifest: 'http://localhost:5000/api/webhooks/kcd/manifest-created'
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    }
  },
  apis: [] // No JSDoc scanning needed - all paths defined above
};

const specs = swaggerJsdoc(options);

export { specs };