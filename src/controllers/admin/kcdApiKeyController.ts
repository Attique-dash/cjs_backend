import { Request, Response } from 'express';
import crypto from 'crypto';
import { ApiKey } from '../../models/ApiKey';
import { AuthRequest } from '../../middleware/auth';

// The shape of req after your auth middleware has run
interface KcdApiKeyRequest extends AuthRequest {
  // Extends existing AuthRequest which already has user?: IUser
}

// ─────────────────────────────────────────────────────────────
// POST /api/admin/api-keys/kcd
// Generates a NEW api key and returns it ONCE (never stored as plain text again)
// Admin calls this via Swagger, copies the key, pastes into KCD portal
// ─────────────────────────────────────────────────────────────
export const generateKCDApiKey = async (req: KcdApiKeyRequest, res: Response): Promise<void> => {
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
      warehouseId,
    } = req.body;

    if (!warehouseId) {
      res.status(400).json({ success: false, message: 'warehouseId is required' });
      return;
    }

    // Generate a cryptographically secure random key
    // Format: kcd_ + 48 hex characters = 52 chars total
    const rawKey = `kcd_${crypto.randomBytes(24).toString('hex')}`;

    // Save to database
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

    // ⚠️ Return the raw key NOW — this is the ONLY time we return it
    // After this point, you can only see the key name and ID, not the key itself
    res.status(201).json({
      success: true,
      message: '✅ KCD API key generated. Copy the "key" value NOW — it will not be shown again.',
      data: {
        id:          apiKey._id,
        key:         rawKey,            // ← COPY THIS INTO KCD PORTAL
        name:        apiKey.name,
        description: apiKey.description,
        permissions: apiKey.permissions,
        isActive:    apiKey.isActive,
        warehouseId: apiKey.warehouseId,
        createdAt:   apiKey.createdAt,
        // Helpful instructions returned in the response
        nextSteps: {
          step1: 'Copy the "key" value above',
          step2: 'Go to https://pack.kcdlogistics.com → Couriers → Edit → Courier System API tab',
          step3: 'Paste the key into the "API Access Token" field',
          step4: 'Enter these endpoint URLs:',
          endpoints: {
            getCustomers:   `${req.protocol}://${req.get('host')}/api/warehouse/customers`,
            addPackage:     `${req.protocol}://${req.get('host')}/api/warehouse/packages/add`,
            updatePackage:  `${req.protocol}://${req.get('host')}/api/warehouse/packages`,
            deletePackage:  `${req.protocol}://${req.get('host')}/api/webhooks/kcd/package-deleted`,
            updateManifest: `${req.protocol}://${req.get('host')}/api/webhooks/kcd/manifest-created`,
          },
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
// Lists all API keys (without the actual key string for security)
// ─────────────────────────────────────────────────────────────
export const listApiKeys = async (req: KcdApiKeyRequest, res: Response): Promise<void> => {
  try {
    const keys = await ApiKey.find({})
      .select('-key')  // NEVER return the actual key in list view
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
// Revokes a key — KCD cannot use it anymore
// ─────────────────────────────────────────────────────────────
export const deactivateApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = await ApiKey.findByIdAndUpdate(
      req.params.keyId,
      { isActive: false },
      { new: true }
    ).select('-key').populate('warehouseId', 'name');

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
// Re-activates a previously deactivated key
// ─────────────────────────────────────────────────────────────
export const activateApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = await ApiKey.findByIdAndUpdate(
      req.params.keyId,
      { isActive: true },
      { new: true }
    ).select('-key').populate('warehouseId', 'name');

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
// Permanently deletes a key record
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
// Returns all the URLs to paste into KCD portal (convenience helper)
// ─────────────────────────────────────────────────────────────
export const getKCDConnectionInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const activeKeys = await ApiKey.find({ isActive: true }).select('-key').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        hasActiveKey:  activeKeys.length > 0,
        activeKeyCount: activeKeys.length,
        instruction: activeKeys.length === 0
          ? 'No active key found. Call POST /api/admin/api-keys/kcd to generate one.'
          : 'Active key exists. Use POST /api/admin/api-keys/kcd to get a new key value if needed.',
        kcdPortalFields: {
          apiAccessToken: activeKeys.length > 0
            ? '✅ Key exists — regenerate via POST /api/admin/api-keys/kcd to get the value'
            : '❌ Generate a key first via POST /api/admin/api-keys/kcd',
          getCustomers:   `${base}/api/warehouse/customers`,
          addPackage:     `${base}/api/warehouse/packages/add`,
          updatePackage:  `${base}/api/warehouse/packages`,
          deletePackage:  `${base}/api/webhooks/kcd/package-deleted`,
          updateManifest: `${base}/api/webhooks/kcd/manifest-created`,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to get KCD info' });
  }
};
