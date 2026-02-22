import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  generateKCDApiKey,
  listApiKeys,
  deactivateApiKey,
  activateApiKey,
  deleteApiKey,
  getKCDConnectionInfo,
} from '../../controllers/admin/kcdApiKeyController';

const router = Router();

// All routes here require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

/**
 * GET /api/admin/api-keys
 * Get information about available API key endpoints
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API Key Management - Available Endpoints',
    availableEndpoints: [
      {
        method: 'POST',
        path: '/api/admin/api-keys/kcd',
        description: 'Generate new KCD API key',
        usage: 'Generate a new API key for KCD Logistics integration',
        requestBody: {
          courierCode: 'string (optional, default: "CLEAN")',
          expiresIn: 'number (optional, default: 365, max: 3650)',
          description: 'string (optional)'
        },
        response: 'Returns the generated API key (shown only once)'
      },
      {
        method: 'POST',
        path: '/api/admin/api-keys/generate',
        description: 'Generate new KCD API key (alias for /kcd)',
        usage: 'Generate a new API key for KCD Logistics integration',
        requestBody: {
          courierCode: 'string (optional, default: "CLEAN")',
          expiresIn: 'number (optional, default: 365, max: 3650)',
          description: 'string (optional)'
        },
        response: 'Returns the generated API key (shown only once)'
      },
      {
        method: 'GET',
        path: '/api/admin/api-keys/list',
        description: 'List all API keys',
        usage: 'View all created API keys (keys are masked for security)',
        response: 'Returns array of API keys with usage statistics'
      },
      {
        method: 'GET',
        path: '/api/admin/api-keys/info',
        description: 'Get KCD connection information',
        usage: 'Get endpoint URLs and configuration for KCD portal',
        response: 'Returns KCD portal configuration and active key status'
      },
      {
        method: 'PUT',
        path: '/api/admin/api-keys/:keyId/deactivate',
        description: 'Deactivate an API key',
        usage: 'Disable an API key without deleting it',
        params: 'keyId: MongoDB ObjectId',
        response: 'Returns deactivated API key details'
      },
      {
        method: 'PUT',
        path: '/api/admin/api-keys/:keyId/activate',
        description: 'Activate an API key',
        usage: 'Re-enable a previously deactivated API key',
        params: 'keyId: MongoDB ObjectId',
        response: 'Returns activated API key details'
      },
      {
        method: 'DELETE',
        path: '/api/admin/api-keys/:keyId',
        description: 'Delete an API key',
        usage: 'Permanently remove an API key',
        params: 'keyId: MongoDB ObjectId',
        response: 'Confirms deletion with deleted key details'
      }
    ],
    notes: [
      'All endpoints require admin authentication',
      'API keys are masked in list responses for security',
      'Generated API keys are shown only once for security',
      'All responses follow format: { success: boolean, message: string, data: {...} }'
    ]
  });
});

/**
 * POST /api/admin/api-keys/kcd
 * Generate a new KCD API key
 */
router.post('/kcd', 
  asyncHandler(generateKCDApiKey)
);

/**
 * POST /api/admin/api-keys/generate
 * Generate a new KCD API key (alias for /kcd)
 */
router.post('/generate', 
  asyncHandler(generateKCDApiKey)
);

/**
 * GET /api/admin/api-keys
 * List all API keys
 */
router.get('/list', 
  asyncHandler(listApiKeys)
);

/**
 * GET /api/admin/api-keys/info
 * Get KCD connection information
 */
router.get('/info', 
  asyncHandler(getKCDConnectionInfo)
);

/**
 * PUT /api/admin/api-keys/:keyId/deactivate
 * Deactivate an API key
 */
router.put('/:keyId/deactivate', 
  asyncHandler(deactivateApiKey)
);

/**
 * PUT /api/admin/api-keys/:keyId/activate
 * Activate an API key
 */
router.put('/:keyId/activate', 
  asyncHandler(activateApiKey)
);

/**
 * DELETE /api/admin/api-keys/:keyId
 * Delete an API key
 */
router.delete('/:keyId', 
  asyncHandler(deleteApiKey)
);

export default router;