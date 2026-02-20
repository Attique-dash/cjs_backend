import { Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { successResponse, errorResponse } from '../utils/helpers';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { generateMailboxCode } from '../utils/mailboxCodeGenerator';
import { EmailService } from '../services/emailService';

interface AuthRequest {
  body: {
    email: string;
    password: string;
  };
}

interface RegisterRequest {
  body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
}

// Universal Login - Handles all user roles (admin, warehouse, customer)
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find any user with the email (all roles) and include password
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      accountStatus: 'active'
    }).select('+passwordHash');

    if (!user) {
      errorResponse(res, 'Invalid credentials', 401);
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      errorResponse(res, 'Invalid credentials', 401);
      return;
    }

    // Generate JWT token
    const signOptions: SignOptions = { expiresIn: config.jwtExpiresIn as any };
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        userCode: user.userCode
      },
      config.jwtSecret,
      signOptions
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User login: ${user.email} (${user.role}) - ${user.userCode}`);

    successResponse(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        userCode: user.userCode,
        firstName: user.firstName,
        lastName: user.lastName,
        mailboxNumber: user.mailboxNumber
      }
    }, 'Login successful');

  } catch (error) {
    logger.error('Login error:', error);
    errorResponse(res, 'Login failed');
  }
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: password123
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               role:
 *                 type: string
 *                 enum: [admin, customer, warehouse]
 *                 example: customer
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: 123 Main St
 *                   city:
 *                     type: string
 *                     example: New York
 *                   state:
 *                     type: string
 *                     example: NY
 *                   zipCode:
 *                     type: string
 *                     example: 10001
 *                   country:
 *                     type: string
 *                     example: USA
 *     responses:
 *       201:
 *         description: Customer registered successfully
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
 *                   example: Registration successful. Please check your email for verification.
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer:
 *                       type: object
 *                       properties:
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         userCode:
 *                           type: string
 *                         address:
 *                           type: object
 *       400:
 *         description: Bad request
 *       409:
 *         description: Email already registered
 */
// Customer & Staff Registration (no admin registration)
export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phone, role, address } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      errorResponse(res, 'First name, last name, email, and password are required', 400);
      return;
    }

    // Restrict roles - no admin registration allowed
    const allowedRoles = ['customer', 'warehouse'];
    const userRole = role || 'customer';
    
    if (!allowedRoles.includes(userRole)) {
      errorResponse(res, 'Invalid role. Only customer and warehouse roles are allowed for registration', 400);
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      errorResponse(res, 'Email already registered', 409);
      return;
    }

    // Generate CLEAN-XXXX code for both userCode and mailboxNumber
    const cleanCode = await generateMailboxCode();

    // Create new user with same code for both userCode and mailboxNumber
    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by pre-save hook
      phone,
      role: userRole,
      address,
      userCode: cleanCode,
      mailboxNumber: cleanCode, // Same as userCode
      accountStatus: 'pending', // Requires email verification
      emailVerified: false
    });

    // Send welcome email with shipping information
    try {
      await EmailService.sendWelcomeWithShippingInfo(
        newUser.email,
        newUser.firstName,
        newUser.userCode,
        newUser.address,
        cleanCode // Using cleanCode as courier code for now
      );
      logger.info(`Welcome email sent to: ${newUser.email}`);
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
      // Continue with registration even if email fails
    }

    // Remove password from response
    const userResponse = newUser.getPublicProfile();

    logger.info(`User registered: ${newUser.email} with code: ${cleanCode} (${userRole})`);

    successResponse(res, {
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        address: newUser.address,
        userCode: newUser.userCode,
        mailboxNumber: newUser.mailboxNumber,
        accountStatus: newUser.accountStatus,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt
      }
    }, 'Registration successful. Please check your email for verification.', 201);

  } catch (error) {
    logger.error('Registration error:', error);
    errorResponse(res, 'Registration failed');
  }
};
