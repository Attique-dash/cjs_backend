import { Router } from 'express';
import authRoutes from './auth';
import warehouseRoutes from './warehouse';
import customerRoutes from './customer';
import adminRoutes from './admin';
import kcdWebhookRoutes from './webhooks/kcd';
import { ensureDatabaseConnection } from '../middleware/databaseConnection';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 version:
 *                   type: string
 */
// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Apply database connection middleware to all routes except health
router.use('/auth', ensureDatabaseConnection, authRoutes);
router.use('/warehouse', ensureDatabaseConnection, warehouseRoutes);
router.use('/customer', ensureDatabaseConnection, customerRoutes);
router.use('/admin', ensureDatabaseConnection, adminRoutes);
router.use('/webhooks/kcd', ensureDatabaseConnection, kcdWebhookRoutes);

export default router;