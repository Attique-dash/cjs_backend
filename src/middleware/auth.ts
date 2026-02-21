import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { config } from '../config/env';
import { errorResponse } from '../utils/helpers';
import { ERROR_MESSAGES } from '../utils/constants';

export interface AuthRequest extends Request {
  user?: IUser;
}

export { Response };

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Get Authorization header (case-insensitive)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Bearer token in the Authorization header.',
        error: 'Missing Authorization header',
        hint: 'Include header: Authorization: Bearer <your-token>',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Normalize header to string
    const authHeaderStr = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    
    // Extract token (handle both "Bearer <token>" and just "<token>")
    let token: string;
    if (authHeaderStr.startsWith('Bearer ') || authHeaderStr.startsWith('bearer ')) {
      token = authHeaderStr.substring(7).trim();
    } else {
      token = authHeaderStr.trim();
    }

    if (!token || token.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid token format. Please provide a valid Bearer token.',
        error: 'Empty token',
        hint: 'Token format: Authorization: Bearer <your-token>',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found. The token is invalid or the user has been deleted.',
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (user.accountStatus !== 'active') {
      res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support to activate your account.',
        error: 'Account inactive',
        timestamp: new Date().toISOString()
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again to get a new token.',
        error: 'Token expired',
        timestamp: new Date().toISOString()
      });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid token. Please provide a valid authentication token.',
        error: 'Invalid token',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Authentication failed. Please check your token and try again.',
        error: 'Authentication error',
        timestamp: new Date().toISOString()
      });
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.',
        error: 'Not authenticated',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. This endpoint requires one of the following roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
        error: 'Insufficient permissions',
        requiredRoles: roles,
        yourRole: req.user.role,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    errorResponse(res, 'Admin access required', 403);
    return;
  }
  next();
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      const user = await User.findById(decoded.userId).select('-passwordHash');
      req.user = user || undefined;
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};