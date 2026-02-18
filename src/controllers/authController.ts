import { Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { successResponse, errorResponse } from '../utils/helpers';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { generateMailboxCode } from '../utils/mailboxCodeGenerator';

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
  };
}

// Warehouse Staff Login
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: { $in: ['admin', 'warehouse'] },
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

    logger.info(`Warehouse staff login: ${user.email} (${user.role})`);

    successResponse(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        userCode: user.userCode,
        firstName: user.firstName,
        lastName: user.lastName
      }
    }, 'Login successful');

  } catch (error) {
    logger.error('Login error:', error);
    errorResponse(res, 'Login failed');
  }
};

// Customer Login
export const customerLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find customer and include password
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: 'customer',
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

    logger.info(`Customer login: ${user.email} (${user.userCode})`);

    successResponse(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        userCode: user.userCode,
        firstName: user.firstName,
        lastName: user.lastName
      }
    }, 'Login successful');

  } catch (error) {
    logger.error('Customer login error:', error);
    errorResponse(res, 'Login failed');
  }
};

// Customer Registration
export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      errorResponse(res, 'First name, last name, email, and password are required', 400);
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      errorResponse(res, 'Email already registered', 409);
      return;
    }

    // Generate mailbox code
    const mailboxNumber = await generateMailboxCode();

    // Generate user code (format: XX-123)
    const userCodeCounter = Math.floor(Math.random() * 900) + 100; // 100-999
    const userCode = `CU-${userCodeCounter}`;

    // Create new customer
    const newCustomer = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by pre-save hook
      phone,
      role: 'customer',
      mailboxNumber,
      userCode,
      accountStatus: 'pending', // Requires email verification
      emailVerified: false
    });

    // Remove password from response
    const customerResponse = newCustomer.getPublicProfile();

    logger.info(`Customer registered: ${newCustomer.email} with mailbox number: ${mailboxNumber}`);

    successResponse(res, {
      customer: customerResponse
    }, 'Registration successful. Please check your email for verification.', 201);

  } catch (error) {
    logger.error('Registration error:', error);
    errorResponse(res, 'Registration failed');
  }
};
