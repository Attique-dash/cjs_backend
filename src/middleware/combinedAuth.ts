import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiKey } from '../models/ApiKey';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { errorResponse } from '../utils/helpers';

/**
 * Combined authentication middleware
 * Accepts EITHER a JWT Bearer token (warehouse staff) OR an X-API-Key (KCD Logistics)
 * This is used on endpoints that KCD needs to call, but staff also use.
 */
export const combinedAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKeyHeader = req.headers['x-api-key'] as string;
    const authHeader = req.headers['authorization'];

    // --- Try API Key first (KCD path) ---
    if (apiKeyHeader) {
      const apiKey = await ApiKey.findOne({ key: apiKeyHeader });

      if (!apiKey || !apiKey.canUse()) {
        errorResponse(res, 'Invalid, inactive, or expired API key', 401);
        return;
      }

      // Track usage
      apiKey.usageCount = (apiKey.usageCount || 0) + 1;
      apiKey.lastUsed = new Date();
      await apiKey.save();

      // Attach a pseudo-user so downstream controllers don't break
      (req as any).user = { role: 'warehouse', _id: apiKey.createdBy, isApiKey: true };
      (req as any).apiKey = apiKey;
      return next();
    }

    // --- Try JWT (staff path) ---
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user || user.accountStatus !== 'active') {
        errorResponse(res, 'User not found or inactive', 401);
        return;
      }

      (req as any).user = user;
      return next();
    }

    errorResponse(res, 'Authentication required. Provide a Bearer token or X-API-Key header.', 401);
  } catch (error) {
    logger.error('combinedAuth error:', error);
    errorResponse(res, 'Authentication failed', 401);
  }
};