import { Router } from 'express';
import { combinedAuth } from '../../middleware/combinedAuth';
import * as packageController from '../../controllers/warehouse/packageController';

const router = Router();

/**
 * @swagger
 * /api/warehouse/packages:
 *   get:
 *     summary: Get all packages
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of packages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Package'
 */
// Get all packages
router.get('/', combinedAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Packages endpoint working',
    data: [
      {
        id: 1,
        trackingNumber: 'TRK001',
        status: 'In Transit',
        weight: 2.5,
        destination: '123 Main St, New York'
      },
      {
        id: 2,
        trackingNumber: 'TRK002', 
        status: 'Delivered',
        weight: 1.8,
        destination: '456 Oak Ave, Los Angeles'
      }
    ]
  });
});

// All routes use combined authentication (JWT or API Key)

/**
 * @swagger
 * /api/warehouse/packages/search:
 *   get:
 *     summary: Search packages
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Search results
 */
// Search/List Packages (Paginated + Filtered) - API SPEC
router.get('/search', 
  combinedAuth, 
  packageController.searchPackages
);

// Get Single Package - API SPEC
router.get('/:id', 
  combinedAuth, 
  packageController.getPackageById
);

// Add New Package - API SPEC
router.post('/add', 
  combinedAuth, 
  packageController.addPackage
);

// Update Package - API SPEC
router.put('/:id', 
  combinedAuth, 
  packageController.updatePackage
);

// Delete Package - API SPEC
router.delete('/:id', 
  combinedAuth, 
  packageController.deletePackage
);

// Update Package Status - API SPEC
router.post('/:id/status', 
  combinedAuth, 
  packageController.updatePackageStatus
);

// Bulk Upload Packages - API SPEC
router.post('/bulk-upload', 
  combinedAuth, 
  packageController.bulkUploadPackages
);

export default router;