import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateMongoId, validatePagination } from '../../utils/validators';
import { asyncHandler } from '../../middleware/errorHandler';
import * as packageController from '../../controllers/customer/packageController';

const router = Router();

// All package routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/customer/packages:
 *   get:
 *     summary: Get customer's packages
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of customer's packages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
// Get customer's packages
router.get('/', validatePagination, asyncHandler(packageController.getCustomerPackages));

/**
 * @swagger
 * /api/customer/packages/{id}:
 *   get:
 *     summary: Get package by ID
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Package details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/:id', validateMongoId, asyncHandler(packageController.getPackageById));

/**
 * @swagger
 * /api/customer/packages/tracking/{trackingNumber}:
 *   get:
 *     summary: Track package by tracking number
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Tracking number
 *     responses:
 *       200:
 *         description: Package tracking information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/tracking/:trackingNumber', asyncHandler(packageController.trackPackage));

// Package operations
router.post('/:id/report-issue', validateMongoId, asyncHandler(packageController.reportIssue));
router.get('/:id/history', validateMongoId, asyncHandler(packageController.getPackageHistory));

export default router;
