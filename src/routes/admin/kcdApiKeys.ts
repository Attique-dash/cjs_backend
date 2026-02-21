import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import * as kcdApiKeyController from '../../controllers/admin/kcdApiKeyController';

const router = Router();

// Apply authentication and authorization to all routes
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/kcd-api-keys/generate:
 *   post:
 *     summary: Generate a new KCD API key
 *     description: Creates a new API key for KCD Logistics integration. The key is shown only once.
 *     tags: [KCD API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courierCode
 *             properties:
 *               courierCode:
 *                 type: string
 *                 description: Courier code (e.g., "CLEAN")
 *                 example: "CLEAN"
 *               expiresIn:
 *                 type: integer
 *                 description: Number of days until key expires
 *                 default: 365
 *                 example: 365
 *               description:
 *                 type: string
 *                 description: Description of the API key purpose
 *                 default: "KCD Logistics Integration API Key"
 *                 example: "KCD Logistics Integration API Key"
 *     responses:
 *       201:
 *         description: API key generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "✅ KCD API key generated. Copy the key NOW — it will NOT be shown again."
 *                 data:
 *                   type: object
 *                   properties:
 *                     apiKey:
 *                       type: string
 *                       example: "kcd_live_1a2b3c4d5e6f7g8h9i0j..."
 *                     courierCode:
 *                       type: string
 *                       example: "CLEAN"
 *                     description:
 *                       type: string
 *                       example: "KCD Logistics Integration API Key"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/generate', asyncHandler(kcdApiKeyController.generateKCDApiKey));

/**
 * @swagger
 * /api/admin/kcd-api-keys:
 *   get:
 *     summary: List all KCD API keys
 *     description: Retrieves a list of all KCD API keys (without showing the actual key values)
 *     tags: [KCD API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     active:
 *                       type: integer
 *                       example: 3
 *                     apiKeys:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           courierCode:
 *                             type: string
 *                           description:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *                           usageCount:
 *                             type: integer
 *                           lastUsed:
 *                             type: string
 *                             format: date-time
 *                           createdBy:
 *                             type: object
 *                             properties:
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/', asyncHandler(kcdApiKeyController.listApiKeys));

/**
 * @swagger
 * /api/admin/kcd-api-keys/info:
 *   get:
 *     summary: Get KCD connection information
 *     description: Returns the exact URLs and configuration needed for KCD portal setup
 *     tags: [KCD API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasActiveKey:
 *                       type: boolean
 *                       example: true
 *                     activeKeyCount:
 *                       type: integer
 *                       example: 1
 *                     instruction:
 *                       type: string
 *                       example: "✅ Active key exists. Regenerate via POST /api/admin/kcd-api-keys/generate if you need the value."
 *                     kcdPortalFields:
 *                       type: object
 *                       properties:
 *                         apiAccessToken:
 *                           type: string
 *                           example: "✅ Key exists — regenerate via POST /api/admin/kcd-api-keys/generate to get the value"
 *                         getCustomers:
 *                           type: string
 *                           example: "http://localhost:5000/api/kcd/customers"
 *                         addPackage:
 *                           type: string
 *                           example: "http://localhost:5000/api/kcd/packages/add"
 *                         updatePackage:
 *                           type: string
 *                           example: "http://localhost:5000/api/kcd/packages/update"
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/info', asyncHandler(kcdApiKeyController.getKCDConnectionInfo));

/**
 * @swagger
 * /api/admin/kcd-api-keys/{keyId}/deactivate:
 *   put:
 *     summary: Deactivate a KCD API key
 *     description: Deactivates a KCD API key, preventing further use
 *     tags: [KCD API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the API key to deactivate
 *     responses:
 *       200:
 *         description: API key deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "API key deactivated. KCD will no longer be able to use it."
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: API key not found
 *       500:
 *         description: Internal server error
 */
router.put('/:keyId/deactivate', asyncHandler(kcdApiKeyController.deactivateApiKey));

/**
 * @swagger
 * /api/admin/kcd-api-keys/{keyId}/activate:
 *   put:
 *     summary: Activate a KCD API key
 *     description: Reactivates a previously deactivated KCD API key
 *     tags: [KCD API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the API key to activate
 *     responses:
 *       200:
 *         description: API key activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "API key reactivated"
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: API key not found
 *       500:
 *         description: Internal server error
 */
router.put('/:keyId/activate', asyncHandler(kcdApiKeyController.activateApiKey));

/**
 * @swagger
 * /api/admin/kcd-api-keys/{keyId}:
 *   delete:
 *     summary: Delete a KCD API key
 *     description: Permanently deletes a KCD API key (cannot be undone)
 *     tags: [KCD API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the API key to delete
 *     responses:
 *       200:
 *         description: API key deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "API key permanently deleted"
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: API key not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:keyId', asyncHandler(kcdApiKeyController.deleteApiKey));

export default router;
