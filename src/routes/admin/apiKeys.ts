import { Router } from 'express';
import { combinedAuth } from '../../middleware/combinedAuth';
import { apiKeyController } from '../../controllers/kcd/apiKeyController';

const router = Router();

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
 *     responses:
 *       201:
 *         description: API key created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/api-keys/kcd', 
  combinedAuth, 
  apiKeyController.createKCDApiKey
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
router.get('/api-keys', 
  combinedAuth, 
  apiKeyController.listApiKeys
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
router.put('/api-keys/:keyId/deactivate', 
  combinedAuth, 
  apiKeyController.deactivateApiKey
);

/**
 * @swagger
 * /api/admin/kcd-connection-info:
 *   get:
 *     summary: Get KCD Connection Information
 *     description: Get all necessary information for connecting KCD Logistics to our backend
 *     tags: [Admin KCD Integration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection information retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/kcd-connection-info', 
  combinedAuth, 
  apiKeyController.getKCDConnectionInfo
);

export default router;
