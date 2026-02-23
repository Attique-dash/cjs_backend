const swaggerJsdoc = require('swagger-jsdoc');

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
      description: 'Clean J Shipping Warehouse Management System API',
      contact: {
        name: 'API Support',
        email: 'support@cleanjshipping.com'
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
          description: 'Enter your KCD API Bearer token (for KCD endpoints only). You can also use X-API-Key header instead.'
        },
        kcdApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-KCD-API-Key',
          description: 'KCD API Key for courier integration (alternative to Bearer token)'
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
      { name: 'KCD Webhooks', description: 'KCD Logistics webhook endpoints' },
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
        },
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
        }
      },
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

      // ─── ADMIN API KEYS ─────────────────────────────────────────────────
      '/api/admin/api-keys/kcd': {
        post: {
          summary: 'Create KCD API Key',
          description: 'Create a new API key for KCD Logistics integration',
          tags: ['Admin API Keys'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    courierCode: { type: 'string', default: 'CLEAN' },
                    expiresIn: { type: 'number', default: 365, description: 'Days until expiration' },
                    description: { type: 'string', default: 'KCD Logistics Integration API Key' }
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
                      apiKey: 'kcd_live_abcdef1234567890abcdef1234567890',
                      courierCode: 'CLEAN',
                      description: 'KCD Logistics Integration API Key',
                      expiresAt: '2025-01-15T10:30:00Z',
                      nextSteps: [
                        '1. Copy the API key above',
                        '2. Go to https://pack.kcdlogistics.com',
                        '3. Admin → Couriers → CLEAN → Edit',
                        '4. Fill "API Access Token" field with the key above',
                        '5. Configure endpoints as shown in GET /api/admin/api-keys/kcd-info'
                      ]
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/admin/api-keys/kcd-info': {
        get: {
          summary: 'Get KCD portal connection info',
          description: 'Returns all URLs to paste into KCD portal',
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
                      kcdPortalConfiguration: {
                        portalUrl: 'https://pack.kcdlogistics.com/',
                        steps: [
                          'Login with: Username: CleanJShip, Password: CleanJ$h!p',
                          'Navigate to Admin → Couriers → CLEAN → Edit',
                          'Fill "Courier System API" tab with values below',
                          'Fill "Packing System API" tab with API token and endpoints'
                        ],
                        apiToken: '✅ Use the key from POST /api/admin/api-keys/kcd response',
                        endpoints: {
                          getCustomers: 'http://localhost:5000/api/kcd/customers',
                          addPackage: 'http://localhost:5000/api/kcd/packages/add',
                          updatePackage: 'http://localhost:5000/api/kcd/packages/update',
                          deletePackage: 'http://localhost:5000/api/webhooks/kcd/package-deleted',
                          updateManifest: 'http://localhost:5000/api/webhooks/kcd/manifest-created',
                          description: 'Copy the above 5 endpoints into KCD portal - first 3 go in "Courier System API" tab, last 2 go in "Packing System API" tab'
                        }
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
          description: 'Retrieve customers for authenticated courier. Use either Authorization: Bearer <token> or X-API-Key header.',
          tags: ['KCD API'],
          security: [
            { kcdBearerAuth: [] },
            { kcdApiKeyAuth: [] }
          ],
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
                          userCode: 'CLEAN-0001',
                          firstName: 'John',
                          lastName: 'Doe',
                          email: 'john@example.com',
                          phone: '+1234567890',
                          address: '123 Main St',
                          mailboxNumber: 'CLEAN-0001'
                        }
                      ],
                      pagination: { total: 1, limit: 50, offset: 0, hasMore: false }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized - Invalid or missing API key', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/kcd/packages/add': {
        post: {
          summary: 'Add Package for KCD Courier',
          description: 'Add a new package to the warehouse system. Use either Authorization: Bearer <token> or X-API-Key header.',
          tags: ['KCD API'],
          security: [
            { kcdBearerAuth: [] },
            { kcdApiKeyAuth: [] }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['trackingNumber', 'customerCode', 'weight'],
                  properties: {
                    trackingNumber: { type: 'string', example: 'TRK123456789' },
                    customerCode: { type: 'string', example: 'CLEAN-0001' },
                    weight: { type: 'number', example: 2.5 },
                    description: { type: 'string', example: 'Electronics package' }
                  }
                },
                example: {
                  trackingNumber: 'TRK123456789',
                  customerCode: 'CLEAN-0001',
                  weight: 2.5,
                  description: 'Electronics package'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Package added successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Package added successfully',
                    data: {
                      trackingNumber: 'TRK123456789',
                      status: 'received',
                      customerCode: 'CLEAN-0001'
                    }
                  }
                }
              }
            },
            400: { description: 'Bad request - Invalid data', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Unauthorized - Invalid or missing API key', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/kcd/packages/update': {
        put: {
          summary: 'Update Package for KCD Courier',
          description: 'Update an existing package in the warehouse system. Use either Authorization: Bearer <token> or X-API-Key header.',
          tags: ['KCD API'],
          security: [
            { kcdBearerAuth: [] },
            { kcdApiKeyAuth: [] }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['trackingNumber'],
                  properties: {
                    trackingNumber: { type: 'string', example: 'TRK123456789' },
                    status: { type: 'string', enum: ['received', 'in_transit', 'out_for_delivery', 'delivered', 'pending', 'customs', 'returned'] },
                    location: { type: 'string', example: 'New York, NY' }
                  }
                },
                example: {
                  trackingNumber: 'TRK123456789',
                  status: 'in_transit',
                  location: 'New York, NY'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Package updated successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Package updated successfully',
                    data: {
                      trackingNumber: 'TRK123456789',
                      status: 'in_transit'
                    }
                  }
                }
              }
            },
            400: { description: 'Bad request - Invalid data', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Unauthorized - Invalid or missing API key', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ─── KCD WEBHOOKS ─────────────────────────────────────────────────────
      '/api/webhooks/kcd/package-created': {
        post: {
          summary: 'KCD Logistics - Package Created Webhook',
          description: 'Webhook endpoint for KCD Logistics to notify when a package is created in their system',
          tags: ['KCD Webhooks'],
          security: [{ kcdApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['trackingNumber', 'courierCode', 'packageData'],
                  properties: {
                    trackingNumber: { type: 'string', description: 'KCD tracking number' },
                    courierCode: { type: 'string', description: 'Courier code (CLEAN)' },
                    packageData: { type: 'object', description: 'Package details from KCD' },
                    timestamp: { type: 'string', format: 'date-time', description: 'Event timestamp' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Webhook processed successfully' },
            401: { description: 'Invalid API key' },
            400: { description: 'Invalid webhook data' }
          }
        }
      },
      '/api/webhooks/kcd/package-updated': {
        post: {
          summary: 'KCD Logistics - Package Updated Webhook',
          description: 'Webhook endpoint for KCD Logistics to notify when a package status is updated',
          tags: ['KCD Webhooks'],
          security: [{ kcdApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['trackingNumber', 'status', 'timestamp'],
                  properties: {
                    trackingNumber: { type: 'string', description: 'KCD tracking number' },
                    status: { type: 'string', enum: ['received', 'in_transit', 'out_for_delivery', 'delivered', 'pending', 'customs', 'returned'], description: 'New package status' },
                    location: { type: 'string', description: 'Current package location' },
                    notes: { type: 'string', description: 'Status update notes' },
                    timestamp: { type: 'string', format: 'date-time', description: 'Event timestamp' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Webhook processed successfully' },
            401: { description: 'Invalid API key' },
            400: { description: 'Invalid webhook data' }
          }
        }
      },
      '/api/webhooks/kcd/package-deleted': {
        post: {
          summary: 'KCD Logistics - Package Deleted Webhook',
          description: 'Webhook endpoint for KCD Logistics to notify when a package is deleted in their system',
          tags: ['KCD Webhooks'],
          security: [{ kcdApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['trackingNumber', 'courierCode'],
                  properties: {
                    trackingNumber: { type: 'string', description: 'KCD tracking number' },
                    courierCode: { type: 'string', description: 'Courier code (CLEAN)' },
                    timestamp: { type: 'string', format: 'date-time', description: 'Event timestamp' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Webhook processed successfully' },
            401: { description: 'Invalid API key' },
            400: { description: 'Invalid webhook data' }
          }
        }
      },
      '/api/webhooks/kcd/manifest-created': {
        post: {
          summary: 'KCD Logistics - Manifest Created Webhook',
          description: 'Webhook endpoint for KCD Logistics to notify when a manifest is created',
          tags: ['KCD Webhooks'],
          security: [{ kcdApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['manifestId', 'courierCode', 'packages', 'timestamp'],
                  properties: {
                    manifestId: { type: 'string', description: 'KCD manifest ID' },
                    courierCode: { type: 'string', description: 'Courier code (CLEAN)' },
                    packages: { type: 'array', items: { type: 'string' }, description: 'Array of tracking numbers' },
                    timestamp: { type: 'string', format: 'date-time', description: 'Event timestamp' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Webhook processed successfully' },
            401: { description: 'Invalid API key' },
            400: { description: 'Invalid webhook data' }
          }
        }
      }
    }
  },
  apis: []
};

const specs = swaggerJsdoc(options);

export { specs };
