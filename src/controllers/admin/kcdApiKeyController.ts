import { Request, Response } from 'express';
import crypto from 'crypto';
import { KcdApiKey } from '../../models/KcdApiKey';
import { AuthRequest } from '../../middleware/auth';
import { generateApiKey } from '../../middleware/authKcd';

// ─────────────────────────────────────────────────────────────
// POST /api/admin/kcd-api-keys/generate
// Generates a new API key for KCD Logistics
// The key is shown ONLY ONCE — copy it into KCD portal
// ─────────────────────────────────────────────────────────────
export const generateKCDApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminUser = req.user;
    if (!adminUser) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const {
      courierCode,
      expiresIn = 365, // days
      description = 'KCD Logistics Integration API Key'
    } = req.body;

    if (!courierCode) {
      res.status(400).json({
        success: false,
        message: 'Courier code is required'
      });
      return;
    }

    // Generate API key
    const apiKey = generateApiKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    const kcdKey = await KcdApiKey.create({
      apiKey,
      courierCode,
      description,
      expiresAt,
      isActive: true,
      createdBy: adminUser._id,
      usageCount: 0,
      lastUsed: null
    });

    // ⚠️ Return the raw key NOW — this is the ONLY time it is shown
    res.status(201).json({
      success: true,
      message: '✅ KCD API key generated. Copy the key NOW — it will NOT be shown again.',
      data: {
        apiKey: kcdKey.apiKey,
        courierCode: kcdKey.courierCode,
        description: kcdKey.description,
        expiresAt: kcdKey.expiresAt,
        createdAt: kcdKey.createdAt
      }
    });
  } catch (error: any) {
    console.error('generateKCDApiKey error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate API key',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/kcd-api-keys
// Lists all KCD API keys (hides the actual key string)
// ─────────────────────────────────────────────────────────────
export const listApiKeys = async (req: Request, res: Response): Promise<void> => {
  try {
    const keys = await KcdApiKey.find({})
      .select('-apiKey')   // NEVER return actual key in list
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        total:   keys.length,
        active:  keys.filter(k => k.isActive).length,
        apiKeys: keys,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to list API keys'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/kcd-api-keys/:keyId/deactivate
// ─────────────────────────────────────────────────────────────
export const deactivateApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const key = await KcdApiKey.findByIdAndUpdate(
      req.params.keyId,
      { 
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: req.user?._id
      },
      { new: true }
    ).select('-apiKey');

    if (!key) {
      res.status(404).json({
        success: false,
        message: 'API key not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'API key deactivated. KCD will no longer be able to use it.',
      data: key,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate API key'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/kcd-api-keys/:keyId/activate
// ─────────────────────────────────────────────────────────────
export const activateApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = await KcdApiKey.findByIdAndUpdate(
      req.params.keyId,
      { 
        isActive: true,
        deactivatedAt: null,
        deactivatedBy: null
      },
      { new: true }
    ).select('-apiKey');

    if (!key) {
      res.status(404).json({
        success: false,
        message: 'API key not found'
      });
      return;
    }

    res.json({ 
      success: true, 
      message: 'API key reactivated', 
      data: key 
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to activate API key'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/kcd-api-keys/:keyId
// ─────────────────────────────────────────────────────────────
export const deleteApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = await KcdApiKey.findByIdAndDelete(req.params.keyId);

    if (!key) {
      res.status(404).json({
        success: false,
        message: 'API key not found'
      });
      return;
    }

    res.json({ 
      success: true, 
      message: 'API key permanently deleted' 
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete API key'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/kcd-api-keys/info
// Returns the exact URLs to paste into the KCD portal
// ─────────────────────────────────────────────────────────────
export const getKCDConnectionInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const activeKeys = await KcdApiKey.find({ isActive: true }).select('-apiKey').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        hasActiveKey:   activeKeys.length > 0,
        activeKeyCount: activeKeys.length,
        instruction: activeKeys.length === 0
          ? '❌ No active key. Call POST /api/admin/kcd-api-keys/generate to generate one.'
          : '✅ Active key exists. Regenerate via POST /api/admin/kcd-api-keys/generate if you need the value.',
        // ── Paste these directly into the KCD portal "Courier System API" tab ──
        kcdPortalFields: {
          apiAccessToken: activeKeys.length > 0
            ? '✅ Key exists — regenerate via POST /api/admin/kcd-api-keys/generate to get the value'
            : '❌ Generate a key first',
          getCustomers:   `${base}/api/kcd/customers`,
          addPackage:     `${base}/api/kcd/packages/add`,
          updatePackage:  `${base}/api/kcd/packages/update`,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get KCD info'
    });
  }
};