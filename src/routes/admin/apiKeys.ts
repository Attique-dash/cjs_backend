import { Router } from 'express';
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
 * @swagger
 * /api/admin/api-keys/kcd:
 *   post:
 *     summary: Create KCD API Key
 *     description: Create a new API key for KCD Logistics webhook integration
 *     tags: [Admin API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: API key name
 *                 default: "KCD Logistics Webhook"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: API key permissions
 *                 default: ["kcd_webhook", "webhook"]
 *               description:
 *                 type: string
 *                 description: API key description
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: API key expiration date (optional)
 *             required:
 *               - name
 *               - permissions
 *               - description
 *     responses:
 *       201:
 *         description: API key created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/kcd', 
  asyncHandler(generateKCDApiKey)
);

/**
 * @swagger
 * /api/admin/api-keys:
 *   get:
 *     summary: List All API Keys
 *     description: Retrieve all API keys (without exposing the actual keys)
 *     tags: [Admin API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', 
  asyncHandler(listApiKeys)
);

/**
 * @swagger
 * /api/admin/api-keys/{keyId}/deactivate:
 *   put:
 *     summary: Deactivate API Key
 *     description: Deactivate an API key to revoke access
 *     tags: [Admin API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key deactivated successfully
 *       404:
 *         description: API key not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:keyId/deactivate', 
  asyncHandler(deactivateApiKey)
);

/**
 * @swagger
 * /api/admin/api-keys/{keyId}/activate:
 *   put:
 *     summary: Activate API Key
 *     description: Reactivate a previously deactivated API key
 *     tags: [Admin API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key activated successfully
 *       404:
 *         description: API key not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:keyId/activate', 
  asyncHandler(activateApiKey)
);

/**
 * @swagger
 * /api/admin/api-keys/{keyId}:
 *   delete:
 *     summary: Delete API Key
 *     description: Permanently delete an API key
 *     tags: [Admin API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key deleted successfully
 *       404:
 *         description: API key not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:keyId', 
  asyncHandler(deleteApiKey)
);

/**
 * @swagger
 * /api/admin/api-keys/kcd-info:
 *   get:
 *     summary: Get KCD portal connection info
 *     description: Returns all URLs to paste into the KCD portal Courier System API tab
 *     tags: [Admin API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection info with all endpoint URLs
 */
router.get('/kcd-info', 
  asyncHandler(getKCDConnectionInfo)
);

export default router;
