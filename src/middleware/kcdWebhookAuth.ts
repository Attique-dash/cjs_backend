import { Request, Response, NextFunction } from 'express';
import { ApiKey } from '../models/ApiKey';
import { logger } from '../utils/logger';

/**
 * KCD Webhook Authentication Middleware
 * KCD sends the API key in the X-API-Key header on every webhook call.
 * This validates that key before allowing access to webhook endpoints.
 */
export const validateKCDWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        success: false,
        message: 'Missing X-API-Key header. KCD must send the API key with every request.'
      });
      return;
    }

    const keyRecord = await ApiKey.findOne({ key: apiKey, isActive: true });

    if (!keyRecord) {
      res.status(401).json({
        success: false,
        message: 'Invalid or inactive API key'
      });
      return;
    }

    // Check expiry
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      res.status(401).json({ success: false, message: 'API key has expired' });
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
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};