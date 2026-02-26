import { Request, Response } from 'express';
import crypto from 'crypto';
import { ApiKey } from '../../models/ApiKey';
import { AuthRequest } from '../../middleware/auth';
import { generateApiKey } from '../../middleware/authKcd';
import { logger } from '../../utils/logger';

// ─────────────────────────────────────────────────────────────
// POST /api/admin/api-keys/kcd
// Generates a new API key for KCD Logistics
// The key is shown ONLY ONCE — copy it into KCD portal
// ─────────────────────────────────────────────────────────────
export const generateKCDApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminUser = req.user;
    if (!adminUser) {
      logger.warn('Unauthorized attempt to generate API key', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const {
      courierCode = 'CLEAN',
      expiresIn = 365, // days
      description = 'KCD Logistics Integration API Key'
    } = req.body;

    if (!courierCode || typeof courierCode !== 'string' || courierCode.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Courier code is required and must be a non-empty string'
      });
      return;
    }

    if (expiresIn && (typeof expiresIn !== 'number' || expiresIn < 1 || expiresIn > 3650)) {
      res.status(400).json({
        success: false,
        message: 'Expiration period must be a number between 1 and 3650 days'
      });
      return;
    }

    logger.info('Generating KCD API key', {
      courierCode,
      expiresIn,
      description,
      requestedBy: adminUser.email,
      ip: req.ip
    });

    // Generate API key
    const apiKey = generateApiKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    const kcdKey = await ApiKey.create({
      key: apiKey,
      name: `KCD ${courierCode.trim().toUpperCase()} Integration`,
      description: description?.trim() || 'KCD Logistics Integration API Key',
      courierCode: courierCode.trim().toUpperCase(),
      permissions: ['kcd_integration'],
      expiresAt,
      isActive: true,
      createdBy: adminUser._id,
      usageCount: 0
    });

    logger.info(`KCD API key generated for ${courierCode}`, {
      apiKeyId: kcdKey._id,
      expiresAt: kcdKey.expiresAt,
      createdBy: adminUser.email
    });

    // ⚠️ Return the raw key NOW — this is the ONLY time it is shown
    res.status(201).json({
      success: true,
      message: '✅ KCD API key generated. Copy the key NOW — it will NOT be shown again.',
      data: {
        apiKey: kcdKey.key,
        courierCode: kcdKey.courierCode,
        description: kcdKey.description,
        expiresAt: kcdKey.expiresAt,
        createdAt: kcdKey.createdAt,
        nextSteps: [
          '1. Copy the API key above',
          '2. Go to https://pack.kcdlogistics.com',
          '3. Admin → Couriers → CLEAN → Edit',
          '4. Fill "API Access Token" field with the key above',
          '5. Configure endpoints as shown below'
        ]
      }
    });
  } catch (error: any) {
    logger.error('generateKCDApiKey error:', {
      error: error.message,
      stack: error.stack,
      requestedBy: req.user?.email,
      ip: req.ip,
      body: req.body
    });
    res.status(500).json({
      success: false,
      message: 'Failed to generate API key',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/api-keys/list
// Lists all KCD API keys (hides the actual key string)
// ─────────────────────────────────────────────────────────────
export const listApiKeys = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Listing API keys', {
      requestedBy: req.ip,
      userAgent: req.get('User-Agent')
    });

    const keys = await ApiKey.find({ 
      courierCode: { $exists: true } // Only show KCD API keys
    })
      .select('-key')   // NEVER return actual key in list
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'API keys retrieved successfully',
      data: {
        total: keys.length,
        active: keys.filter(k => k.isActive).length,
        apiKeys: keys.map(key => ({
          _id: key._id,
          courierCode: key.courierCode,
          description: key.description,
          isActive: key.isActive,
          expiresAt: key.expiresAt,
          createdAt: key.createdAt,
          lastUsed: key.lastUsed,
          usageCount: key.usageCount,
          createdBy: key.createdBy,
          isExpired: key.expiresAt ? key.expiresAt < new Date() : false
        }))
      }
    });
  } catch (error: any) {
    logger.error('listApiKeys error:', {
      error: error.message,
      stack: error.stack,
      requestedBy: req.ip
    });
    res.status(500).json({
      success: false,
      message: 'Failed to list API keys',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/api-keys/:keyId/deactivate
// ─────────────────────────────────────────────────────────────
export const deactivateApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { keyId } = req.params;
    
    if (!keyId || keyId.length !== 24) {
      res.status(400).json({
        success: false,
        message: 'Valid key ID is required'
      });
      return;
    }

    logger.info('Attempting to deactivate API key', {
      keyId,
      requestedBy: req.user?.email,
      ip: req.ip
    });

    const key = await ApiKey.findByIdAndUpdate(
      keyId,
      { 
        isActive: false,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-key');

    if (!key) {
      logger.warn('API key not found for deactivation', { keyId });
      res.status(404).json({
        success: false,
        message: 'API key not found'
      });
      return;
    }

    logger.info(`API key deactivated: ${key.courierCode}`, {
      keyId: key._id,
      deactivatedBy: req.user?.email,
      deactivatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'API key deactivated. KCD will no longer be able to use it.',
      data: key
    });
  } catch (error: any) {
    logger.error('deactivateApiKey error:', {
      error: error.message,
      stack: error.stack,
      keyId: req.params.keyId,
      requestedBy: req.user?.email
    });
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate API key',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/api-keys/:keyId/activate
// ─────────────────────────────────────────────────────────────
export const activateApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { keyId } = req.params;
    
    if (!keyId || keyId.length !== 24) {
      res.status(400).json({
        success: false,
        message: 'Valid key ID is required'
      });
      return;
    }

    logger.info('Attempting to activate API key', {
      keyId,
      requestedBy: req.user?.email,
      ip: req.ip
    });

    const key = await ApiKey.findByIdAndUpdate(
      keyId,
      { 
        isActive: true,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-key');

    if (!key) {
      logger.warn('API key not found for activation', { keyId });
      res.status(404).json({
        success: false,
        message: 'API key not found'
      });
      return;
    }

    logger.info(`API key activated: ${key.courierCode}`, {
      keyId: key._id,
      activatedBy: req.user?.email,
      activatedAt: new Date()
    });

    res.status(200).json({ 
      success: true, 
      message: 'API key reactivated successfully',
      data: key 
    });
  } catch (error: any) {
    logger.error('activateApiKey error:', {
      error: error.message,
      stack: error.stack,
      keyId: req.params.keyId,
      requestedBy: req.user?.email
    });
    res.status(500).json({
      success: false,
      message: 'Failed to activate API key',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/api-keys/:keyId
// ─────────────────────────────────────────────────────────────
export const deleteApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { keyId } = req.params;
    
    if (!keyId || keyId.length !== 24) {
      res.status(400).json({
        success: false,
        message: 'Valid key ID is required'
      });
      return;
    }

    logger.info('Attempting to delete API key', {
      keyId,
      requestedBy: req.user?.email,
      ip: req.ip
    });

    const key = await ApiKey.findByIdAndDelete(keyId);

    if (!key) {
      logger.warn('API key not found for deletion', { keyId });
      res.status(404).json({
        success: false,
        message: 'API key not found'
      });
      return;
    }

    logger.info(`API key deleted: ${key.courierCode}`, {
      keyId: key._id,
      deletedBy: req.user?.email,
      deletedAt: new Date()
    });

    res.status(200).json({ 
      success: true, 
      message: 'API key permanently deleted successfully',
      data: {
        deletedKeyId: key._id,
        courierCode: key.courierCode
      }
    });
  } catch (error: any) {
    logger.error('deleteApiKey error:', {
      error: error.message,
      stack: error.stack,
      keyId: req.params.keyId,
      requestedBy: req.user?.email
    });
    res.status(500).json({
      success: false,
      message: 'Failed to delete API key',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/api-keys/info
// Returns the exact URLs to paste into the KCD portal
// ─────────────────────────────────────────────────────────────
export const getKCDConnectionInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fix for Vercel: ensure HTTPS protocol is used
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const base = `${proto}://${req.get('host')}`;
    
    logger.info('Retrieving KCD connection info', {
      requestedBy: req.ip,
      userAgent: req.get('User-Agent'),
      host: req.get('host')
    });

    const activeKeys = await ApiKey.find({ 
      isActive: true,
      courierCode: { $exists: true } 
    }).select('-key').sort({ createdAt: -1 });

    const info = {
      hasActiveKey: activeKeys.length > 0,
      activeKeyCount: activeKeys.length,
      instruction: activeKeys.length === 0
        ? '❌ No active key. Call POST /api/admin/api-keys/kcd to generate one.'
        : '✅ Active key exists. Regenerate via POST /api/admin/api-keys/kcd if you need the value.',
      // ── Paste these directly into the KCD portal "Courier System API" tab ──
      kcdPortalConfiguration: {
        portalUrl: 'https://pack.kcdlogistics.com/',
        steps: [
          'Login with: Username: CleanJShip, Password: CleanJ$h!p',
          'Navigate to Admin → Couriers → CLEAN → Edit',
          'Fill "Courier System API" tab with values below',
          'Fill "Packing System API" tab with API token and these endpoints'
        ],
        apiToken: activeKeys.length > 0
          ? '✅ Use the key from POST /api/admin/api-keys/kcd response'
          : '❌ Generate a key first via POST /api/admin/api-keys/kcd',
        endpoints: {
          getCustomers:   `${base}/api/kcd/customers`,
          addPackage:     `${base}/api/kcd/packages/add`,
          updatePackage:  `${base}/api/kcd/packages/{trackingNumber}`,
          deletePackage:  `${base}/api/kcd/packages/{trackingNumber}`,
          updateManifest: `${base}/api/kcd/packages/{trackingNumber}/manifest`,
          description: 'Copy the above 5 endpoints into KCD portal "Courier System API" tab'
        }
      },
      createdKeys: activeKeys.map(k => ({
        _id: k._id,
        courierCode: k.courierCode,
        createdAt: k.createdAt,
        expiresAt: k.expiresAt,
        usageCount: k.usageCount,
        lastUsed: k.lastUsed
      }))
    };

    logger.info('KCD connection info retrieved', {
      activeKeyCount: activeKeys.length,
      hasActiveKey: activeKeys.length > 0,
      requestedBy: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'KCD connection information retrieved successfully',
      data: info
    });
  } catch (error: any) {
    logger.error('getKCDConnectionInfo error:', {
      error: error.message,
      stack: error.stack,
      requestedBy: req.ip,
      host: req.get('host')
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get KCD connection info',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};