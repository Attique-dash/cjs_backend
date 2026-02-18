import { Router } from 'express';
import { login, customerLogin, register } from '../controllers/authController';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided details. The user will be registered with 'pending' status and will need email verification.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             email: "john.doe@example.com"
 *             passwordHash: "SecurePassword123!"
 *             phone: "+1234567890"
 *             role: "customer"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "User registered successfully. Please check your email for verification."
 *               data:
 *                 userCode: "US-12345"
 *                 email: "john.doe@example.com"
 *                 accountStatus: "pending"
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Email already exists"
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Password must be at least 8 characters long"
 */
// Register User
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user (warehouse staff)
 *     description: Authenticates warehouse staff users and returns a JWT token for accessing protected endpoints.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *           example:
 *             email: "admin@warehouse.com"
 *             password: "AdminPassword123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   id: "64a1b2c3d4e5f6789012345"
 *                   email: "admin@warehouse.com"
 *                   role: "admin"
 *                   accountStatus: "active"
 *                 expiresIn: "24h"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid email or password"
 *       403:
 *         description: Account not active
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Account is not active. Please contact administrator."
 */
// Warehouse Staff Login
router.post('/login', login);

/**
 * @swagger
 * /api/auth/customer/login:
 *   post:
 *     summary: Login customer
 *     description: Authenticates customer users and returns a JWT token for accessing customer-specific endpoints.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *           example:
 *             email: "customer@example.com"
 *             password: "CustomerPassword123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   id: "64a1b2c3d4e5f6789012346"
 *                   email: "customer@example.com"
 *                   role: "customer"
 *                   accountStatus: "active"
 *                   userCode: "CS-12345"
 *                 expiresIn: "24h"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Invalid email or password"
 *       403:
 *         description: Account not verified or active
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Please verify your email address before logging in"
 */
// Customer Login
router.post('/customer/login', customerLogin);

export default router;
