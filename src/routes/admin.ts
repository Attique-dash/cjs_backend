import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateMongoId, validatePagination } from '../utils/validators';
import { asyncHandler } from '../middleware/errorHandler';
import * as adminController from '../controllers/adminController';
import apiKeyRoutes from './admin/apiKeys';

const router = Router();

/**
 * @swagger
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers (admin only)
 *     description: Retrieves a comprehensive list of all customers in the system with pagination and search capabilities. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query for name, email, or user code
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/customers', 
  authenticate, 
  authorize('admin'), 
  validatePagination, 
  asyncHandler(adminController.getAllCustomers)
);


/**
 * @swagger
 * /api/admin/staff:
 *   get:
 *     summary: Get all warehouse staff (admin only)
 *     description: Retrieves a comprehensive list of all warehouse staff members with pagination and search capabilities. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query for staff name, email, or user code
 *     responses:
 *       200:
 *         description: Staff retrieved successfully
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/staff', 
  authenticate, 
  authorize('admin'), 
  validatePagination, 
  asyncHandler(adminController.getAllStaff)
);

/**
 * @swagger
 * /api/admin/packages:
 *   get:
 *     summary: Get all packages (admin only)
 *     description: Retrieves a comprehensive list of all packages in the system with pagination, filtering, and search capabilities. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [received, in_transit, out_for_delivery, delivered, pending, customs, returned, at_warehouse, processing, ready_for_pickup]
 *         description: Filter by package status
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query for tracking number, description, shipper, or recipient
 *     responses:
 *       200:
 *         description: Packages retrieved successfully
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/packages', 
  authenticate, 
  authorize('admin'), 
  validatePagination, 
  asyncHandler(adminController.getAllPackages)
);

/**
 * @swagger
 * /api/admin/inventory:
 *   get:
 *     summary: Get all inventory (admin only)
 *     description: Retrieves a comprehensive list of all inventory items with pagination, filtering, and search capabilities. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by inventory category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query for item name, SKU, or description
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/inventory', 
  authenticate, 
  authorize('admin'), 
  validatePagination, 
  asyncHandler(adminController.getAllInventory)
);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics (admin only)
 *     description: Retrieves comprehensive system statistics including user counts, package status, and inventory levels. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         customers:
 *                           type: integer
 *                         staff:
 *                           type: integer
 *                     packages:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         pending:
 *                           type: integer
 *                         delivered:
 *                           type: integer
 *                     inventory:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         lowStock:
 *                           type: integer
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/stats', 
  authenticate, 
  authorize('admin'), 
  asyncHandler(adminController.getSystemStats)
);


/**
 * @swagger
 * /api/admin/users/{userCode}/role:
 *   put:
 *     summary: Change user role (admin only)
 *     description: Changes the role of any user in the system. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userCode
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z]{2,6}-\d{3,4}$'
 *         description: User Code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, customer, warehouse]
 *                 description: New user role
 *                 example: "customer"
 *           example:
 *             role: "warehouse"
 *     responses:
 *       200:
 *         description: User role changed successfully
 *       400:
 *         description: Invalid role or request data
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put('/users/:userCode/role', 
  authenticate, 
  authorize('admin'), 
  asyncHandler(adminController.changeUserRole)
);

/**
 * @swagger
 * /api/admin/users/{userCode}/status:
 *   put:
 *     summary: Update user account status (admin only)
 *     description: Updates the account status and email verification status of any user. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userCode
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z]{2,6}-\d{3,4}$'
 *         description: User Code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountStatus:
 *                 type: string
 *                 enum: [pending, active, inactive]
 *                 description: Account status
 *                 example: "active"
 *               emailVerified:
 *                 type: boolean
 *                 description: Email verification status
 *                 example: true
 *           example:
 *             accountStatus: "active"
 *             emailVerified: true
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid status or request data
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put('/users/:userCode/status', 
  authenticate, 
  authorize('admin'), 
  asyncHandler(adminController.updateUserStatus)
);

/**
 * @swagger
 * /api/admin/users/{userCode}:
 *   delete:
 *     summary: Delete user (admin only)
 *     description: Deletes a user (staff or customer) from the system. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userCode
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z]{2,6}-\d{3,4}$'
 *         description: User Code
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete('/users/:userCode', 
  authenticate, 
  authorize('admin'), 
  asyncHandler(adminController.deleteUser)
);

/**
 * @swagger
 * /api/admin/staff:
 *   post:
 *     summary: Add new warehouse staff (admin only)
 *     description: Creates a new warehouse staff member with unique user code and assigned permissions. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Staff member's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: Staff member's last name
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Staff member's email address
 *                 example: "john.doe@warehouse.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Staff member's password
 *                 example: "SecurePassword123!"
 *               phone:
 *                 type: string
 *                 description: Staff member's phone number
 *                 example: "+1234567890"
 *               assignedWarehouse:
 *                 type: string
 *                 description: Warehouse ID to assign staff to
 *                 example: "507f1f77bcf86cd799439011"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of permissions for the staff member
 *                 example: ["inventory_management", "package_processing"]
 *           example:
 *             firstName: "Jane"
 *             lastName: "Smith"
 *             email: "jane.smith@warehouse.com"
 *             password: "WarehousePass123!"
 *             phone: "+1234567890"
 *             permissions: ["inventory_management", "package_processing"]
 *     responses:
 *       201:
 *         description: Warehouse staff created successfully
 *       400:
 *         description: Invalid request data or missing required fields
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       409:
 *         description: User with this email already exists
 */
router.post('/staff', 
  authenticate, 
  authorize('admin'), 
  asyncHandler(adminController.addWarehouseStaff)
);

/**
 * @swagger
 * /api/admin/shipping-addresses:
 *   get:
 *     summary: Get all shipping addresses (admin only)
 *     description: Retrieves all shipping addresses from all users with pagination and filtering capabilities. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [air, sea, china, standard]
 *         description: Filter by address type
 *     responses:
 *       200:
 *         description: Shipping addresses retrieved successfully
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/shipping-addresses', 
  authenticate, 
  authorize('admin'), 
  validatePagination, 
  asyncHandler(adminController.getAllShippingAddresses)
);

/**
 * @swagger
 * /api/admin/shipping-address/{type}:
 *   put:
 *     summary: Update shipping address by type (admin only)
 *     description: Updates shipping addresses of a specific type for all users who have that address type. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [air, sea, china, standard]
 *         description: Address type to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address]
 *             properties:
 *               address:
 *                 type: object
 *                 required: [street, city, state, zipCode]
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "123 Main St"
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   state:
 *                     type: string
 *                     example: "NY"
 *                   zipCode:
 *                     type: string
 *                     example: "10001"
 *                   country:
 *                     type: string
 *                     example: "USA"
 *           example:
 *             address:
 *               street: "456 Oak Ave"
 *               city: "Los Angeles"
 *               state: "CA"
 *               zipCode: "90001"
 *               country: "USA"
 *     responses:
 *       200:
 *         description: Shipping addresses updated successfully
 *       400:
 *         description: Invalid request data or address type
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: No users found with specified address type
 */
router.put('/shipping-address/:type', 
  authenticate, 
  authorize('admin'), 
  asyncHandler(adminController.updateShippingAddressByType)
);

// Mount API key management routes
router.use('/api-keys', apiKeyRoutes);

export default router;
