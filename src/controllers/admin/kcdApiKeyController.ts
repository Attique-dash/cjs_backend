import { Request, Response } from 'express';
import crypto from 'crypto';
import { ApiKey } from '../../models/ApiKey';
import { Warehouse } from '../../models/Warehouse';
import { AuthRequest } from '../../middleware/auth';

// ─────────────────────────────────────────────────────────────
// POST /api/admin/api-keys/kcd
// Generates a new API key for KCD Logistics
// warehouseId is now AUTO-RESOLVED from the default warehouse
// The key is shown ONLY ONCE — copy it into KCD portal
// ─────────────────────────────────────────────────────────────
export const generateKCDApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminUser = req.user;
    if (!adminUser) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const {
      name        = 'KCD Logistics Webhook',
      description = 'API key for KCD Logistics packing system',
      permissions = ['kcd_webhook', 'webhook', 'all'],
    } = req.body;

    // ── Auto-resolve warehouse (no longer require the caller to know it) ──
    let warehouseId = req.body.warehouseId;
    if (!warehouseId) {
      const warehouse = await Warehouse.findOne({ isActive: true }).sort({ isDefault: -1 });
      if (!warehouse) {
        res.status(400).json({
          success: false,
          message: 'No active warehouse found. Please create a warehouse first.'
        });
        return;
      }
      warehouseId = warehouse._id;
    }

    // Generate cryptographically secure key: kcd_ + 48 hex chars = 52 chars total
    const rawKey = `kcd_${crypto.randomBytes(24).toString('hex')}`;

    const apiKey = await ApiKey.create({
      key:         rawKey,
      name,
      description,
      permissions,
      isActive:    true,
      usageCount:  0,
      warehouseId,
      createdBy:   adminUser._id,
    });

    const base = `${req.protocol}://${req.get('host')}`;

    // ⚠️ Return the raw key NOW — this is the ONLY time it is shown
    res.status(201).json({
      success: true,
      message: '✅ KCD API key generated. Copy the key NOW — it will NOT be shown again.',
      data: {
        id:          apiKey._id,
        key:         rawKey,            // ← PASTE THIS INTO KCD PORTAL
        name:        apiKey.name,
        description: apiKey.description,
        permissions: apiKey.permissions,
        isActive:    apiKey.isActive,
        createdAt:   apiKey.createdAt,
        // ── Fields to paste directly into the KCD portal ──
        kcdPortalFields: {
          apiAccessToken: rawKey,
          getCustomers:   `${base}/api/warehouse/customers`,
          addPackage:     `${base}/api/warehouse/packages/add`,
          updatePackage:  `${base}/api/warehouse/packages/:id`,
          deletePackage:  `${base}/api/webhooks/kcd/package-deleted`,
          updateManifest: `${base}/api/webhooks/kcd/manifest-created`,
        },
      },
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
// GET /api/admin/api-keys
// Lists all API keys (hides the actual key string)
// ─────────────────────────────────────────────────────────────
export const listApiKeys = async (req: Request, res: Response): Promise<void> => {
  try {
    const keys = await ApiKey.find({})
      .select('-key')   // NEVER return actual key in list
      .populate('warehouseId', 'name')
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
    res.status(500).json({ success: false, message: 'Failed to list API keys' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/api-keys/:keyId/deactivate
// ─────────────────────────────────────────────────────────────
export const deactivateApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = await ApiKey.findByIdAndUpdate(
      req.params.keyId,
      { isActive: false },
      { new: true }
    ).select('-key');

    if (!key) {
      res.status(404).json({ success: false, message: 'API key not found' });
      return;
    }

    res.json({
      success: true,
      message: 'API key deactivated. KCD will no longer be able to use it.',
      data: key,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to deactivate API key' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/api-keys/:keyId/activate
// ─────────────────────────────────────────────────────────────
export const activateApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = await ApiKey.findByIdAndUpdate(
      req.params.keyId,
      { isActive: true },
      { new: true }
    ).select('-key');

    if (!key) {
      res.status(404).json({ success: false, message: 'API key not found' });
      return;
    }

    res.json({ success: true, message: 'API key reactivated', data: key });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to activate API key' });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/api-keys/:keyId
// ─────────────────────────────────────────────────────────────
export const deleteApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = await ApiKey.findByIdAndDelete(req.params.keyId);

    if (!key) {
      res.status(404).json({ success: false, message: 'API key not found' });
      return;
    }

    res.json({ success: true, message: 'API key permanently deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete API key' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/api-keys/kcd-info
// Returns the exact URLs to paste into the KCD portal
// ─────────────────────────────────────────────────────────────
export const getKCDConnectionInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const activeKeys = await ApiKey.find({ isActive: true }).select('-key').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        hasActiveKey:   activeKeys.length > 0,
        activeKeyCount: activeKeys.length,
        instruction: activeKeys.length === 0
          ? '❌ No active key. Call POST /api/admin/api-keys/kcd to generate one.'
          : '✅ Active key exists. Regenerate via POST /api/admin/api-keys/kcd if you need the value.',
        // ── Paste these directly into the KCD portal "Courier System API" tab ──
        kcdPortalFields: {
          apiAccessToken: activeKeys.length > 0
            ? '✅ Key exists — regenerate via POST /api/admin/api-keys/kcd to get the value'
            : '❌ Generate a key first',
          getCustomers:   `${base}/api/warehouse/customers`,
          addPackage:     `${base}/api/warehouse/packages/add`,
          updatePackage:  `${base}/api/warehouse/packages/:id`,
          deletePackage:  `${base}/api/webhooks/kcd/package-deleted`,
          updateManifest: `${base}/api/webhooks/kcd/manifest-created`,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to get KCD info' });
  }
};