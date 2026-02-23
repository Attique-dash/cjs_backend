import { Request, Response, NextFunction } from 'express';
import { KcdApiKey } from '../models/KcdApiKey';
import { logger } from '../utils/logger';
import { errorResponse } from '../utils/helpers';

/**
 * KCD Webhook Authentication Middleware
 * KCD sends the API key in the X-API-Key header on every webhook call.
 * This validates that key before allowing access to webhook endpoints.
 */
export const validateKCDWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Try both headers for backward compatibility
    const apiKey = (req.headers['x-kcd-api-key'] as string) || 
                   (req.headers['x-api-key'] as string) ||
                   (req.headers['X-KCD-API-Key'] as string) || 
                   (req.headers['X-API-Key'] as string);

    if (!apiKey) {
      errorResponse(res, 'Missing X-KCD-API-Key or X-API-Key header. KCD must send the API key with every request.', 401);
      return;
    }

    const keyRecord = await KcdApiKey.findOne({ 
      apiKey: apiKey.trim(), 
      isActive: true 
    });

    if (!keyRecord) {
      errorResponse(res, 'Invalid or inactive API key', 401);
      return;
    }

    // Check expiry
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      errorResponse(res, 'API key has expired', 401);
      return;
    }

    // Track usage
    keyRecord.usageCount = (keyRecord.usageCount || 0) + 1;
    keyRecord.lastUsed = new Date();
    await keyRecord.save();

    (req as any).apiKey = keyRecord;
    next();
  } catch (error) {
    logger.error('KCD webhook auth error:', error);
    errorResponse(res, 'Authentication error', 500);
  }
};