import { Request, Response, NextFunction } from 'express';
import { ApiKey } from '../models/ApiKey';
import { errorResponse } from '../utils/helpers';
import { logger } from '../utils/logger';

// KCD Webhook Authentication Middleware
export const validateKCDWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get API key from header
    const apiKey = req.header('X-API-Key') || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      errorResponse(res, 'API key required for KCD webhook access', 401);
      return;
    }

    // Find API key in database
    const keyDoc = await ApiKey.findOne({ 
      key: apiKey,
      isActive: true,
      permissions: { $in: ['kcd_webhook', 'webhook', 'all'] }
    });

    if (!keyDoc) {
      logger.warn(`Invalid KCD webhook API key attempt: ${apiKey.substring(0, 8)}...`);
      errorResponse(res, 'Invalid or inactive API key', 401);
      return;
    }

    // Update last used timestamp
    keyDoc.lastUsed = new Date();
    await keyDoc.save();

    // Add webhook context to request
    req.webhookContext = {
      source: 'kcd',
      apiKeyId: keyDoc._id,
      validatedAt: new Date()
    };

    logger.info(`KCD webhook authenticated successfully: ${keyDoc.name}`);

    next();
  } catch (error) {
    logger.error('KCD webhook authentication error:', error);
    errorResponse(res, 'Webhook authentication failed', 500);
  }
};

// Extend Request interface to include webhook context
declare global {
  namespace Express {
    interface Request {
      webhookContext?: {
        source: string;
        apiKeyId: any;
        validatedAt: Date;
      };
    }
  }
}
