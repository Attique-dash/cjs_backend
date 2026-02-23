import { Router, Request, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import { KcdApiKey } from '../../models/KcdApiKey';

const router = Router();

// Temporary endpoint to get actual KCD API key value
router.get('/get-kcd-key', 
  authenticate, 
  authorize('admin'), 
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Get the actual API key value (include apiKey field)
      const activeKey = await KcdApiKey.findOne({ isActive: true }).sort({ createdAt: -1 });
      
      if (!activeKey) {
        res.status(404).json({
          success: false,
          message: 'No active KCD API key found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Active KCD API key retrieved',
        data: {
          apiKey: activeKey.apiKey, // Include the actual key
          courierCode: activeKey.courierCode,
          createdAt: activeKey.createdAt,
          expiresAt: activeKey.expiresAt,
          usageCount: activeKey.usageCount,
          lastUsed: activeKey.lastUsed,
          isActive: activeKey.isActive
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get KCD API key',
        error: error.message
      });
    }
  })
);

export default router;
