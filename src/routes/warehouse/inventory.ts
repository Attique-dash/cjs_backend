import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateCreateInventory, validateMongoId, validatePagination } from '../../utils/validators';
import { asyncHandler } from '../../middleware/errorHandler';
import * as inventoryController from '../../controllers/warehouse/inventoryController';

const router = Router();

/**
 * @swagger
 * /api/warehouse/inventory:
 *   get:
 *     summary: Get warehouse inventory
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory list
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
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       price:
 *                         type: number
 */
// Get inventory (mock data for testing)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory endpoint working',
    data: [
      {
        id: 1,
        product: 'Laptop',
        quantity: 50,
        price: 999.99,
        sku: 'LAP-001'
      },
      {
        id: 2,
        product: 'Phone',
        quantity: 100,
        price: 699.99,
        sku: 'PHN-002'
      },
      {
        id: 3,
        product: 'Tablet',
        quantity: 25,
        price: 399.99,
        sku: 'TAB-003'
      }
    ]
  });
});

// All inventory routes require authentication
router.use(authenticate);

// Inventory CRUD operations
router.get('/', validatePagination, asyncHandler(inventoryController.getInventory));
router.get('/:id', validateMongoId, asyncHandler(inventoryController.getInventoryById));
router.post('/', authorize('admin', 'warehouse_staff'), validateCreateInventory, asyncHandler(inventoryController.createInventory));
router.put('/:id', authorize('admin', 'warehouse_staff'), validateMongoId, asyncHandler(inventoryController.updateInventory));
router.delete('/:id', authorize('admin'), validateMongoId, asyncHandler(inventoryController.deleteInventory));

// Inventory operations
router.post('/:id/adjust', authorize('admin', 'warehouse_staff'), validateMongoId, asyncHandler(inventoryController.adjustInventory));
router.get('/:id/transactions', validateMongoId, validatePagination, asyncHandler(inventoryController.getInventoryTransactions));
router.get('/low-stock', asyncHandler(inventoryController.getLowStockItems));

export default router;
