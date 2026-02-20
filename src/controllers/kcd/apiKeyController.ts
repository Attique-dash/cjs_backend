import { Response, Request } from 'express';
import { ApiKey } from '../../models/ApiKey';
import { successResponse, errorResponse } from '../../utils/helpers';
import { logger } from '../../utils/logger';
import crypto from 'crypto';
import mongoose from 'mongoose';

interface ApiKeyRequest extends Request {
  body: {
    name?: string;
    permissions?: string[];
    description?: string;
    expiresAt?: string;
  };
  user?: any;
}

export class apiKeyController {
  
  // Create new API key for KCD integration
  static async createKCDApiKey(req: ApiKeyRequest, res: Response): Promise<void> {
    try {
      const { name, permissions, description, expiresAt } = req.body;

      // Generate API key
      const apiKey = `kcd_${crypto.randomBytes(32).toString('hex')}`;
      
      const newApiKey = new ApiKey({
        key: apiKey,
        name: name || 'KCD Logistics Webhook',
        permissions: permissions || ['kcd_webhook', 'webhook'],
        description: description || 'API key for KCD Logistics webhook integration',
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: req.user?.id || new mongoose.Types.ObjectId()
      });

      await newApiKey.save();

      logger.info(`KCD API key created: ${newApiKey.name}`);

      successResponse(res, {
        apiKey: apiKey,
        keyId: newApiKey._id,
        name: newApiKey.name,
        permissions: newApiKey.permissions,
        expiresAt: newApiKey.expiresAt,
        createdAt: newApiKey.createdAt
      }, 'KCD API key created successfully');

    } catch (error) {
      logger.error('Error creating KCD API key:', error);
      errorResponse(res, 'Failed to create API key', 500);
    }
  }

  // List all API keys
  static async listApiKeys(req: Request, res: Response): Promise<void> {
    try {
      const apiKeys = await ApiKey.find({})
        .select('-key') // Don't expose the actual keys
        .sort({ createdAt: -1 });

      successResponse(res, {
        apiKeys,
        total: apiKeys.length
      }, 'API keys retrieved successfully');

    } catch (error) {
      logger.error('Error listing API keys:', error);
      errorResponse(res, 'Failed to retrieve API keys', 500);
    }
  }

  // Deactivate API key
  static async deactivateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { keyId } = req.params;

      const apiKey = await ApiKey.findByIdAndUpdate(
        keyId,
        { isActive: false },
        { new: true }
      );

      if (!apiKey) {
        errorResponse(res, 'API key not found', 404);
        return;
      }

      logger.info(`API key deactivated: ${apiKey.name}`);

      successResponse(res, {
        keyId: apiKey._id,
        name: apiKey.name,
        deactivatedAt: new Date()
      }, 'API key deactivated successfully');

    } catch (error) {
      logger.error('Error deactivating API key:', error);
      errorResponse(res, 'Failed to deactivate API key', 500);
    }
  }

  // Get KCD connection instructions
  static async getKCDConnectionInfo(req: Request, res: Response): Promise<void> {
    try {
      // Get active KCD API keys
      const activeKeys = await ApiKey.find({
        isActive: true,
        permissions: { $in: ['kcd_webhook', 'webhook'] }
      }).select('key name permissions createdAt');

      const baseUrl = process.env.BASE_URL || 'https://your-domain.com';
      
      const connectionInfo = {
        courierCode: 'CLEAN',
        webhookEndpoints: {
          packageCreated: `${baseUrl}/api/webhooks/kcd/package-created`,
          packageUpdated: `${baseUrl}/api/webhooks/kcd/package-updated`,
          packageDelivered: `${baseUrl}/api/webhooks/kcd/package-delivered`,
          manifestCreated: `${baseUrl}/api/webhooks/kcd/manifest-created`,
          testConnection: `${baseUrl}/api/webhooks/kcd/test`
        },
        authentication: {
          method: 'API Key',
          header: 'X-API-Key',
          activeKeys: activeKeys.map((key: any) => ({
            name: key.name,
            key: key.key,
            permissions: key.permissions,
            createdAt: key.createdAt
          }))
        },
        supportedEvents: [
          'package-created',
          'package-updated', 
          'package-delivered',
          'manifest-created'
        ],
        dataFormat: 'JSON',
        timeout: 30000 // 30 seconds
      };

      successResponse(res, connectionInfo, 'KCD connection information retrieved successfully');

    } catch (error) {
      logger.error('Error getting KCD connection info:', error);
      errorResponse(res, 'Failed to retrieve connection info', 500);
    }
  }
}
