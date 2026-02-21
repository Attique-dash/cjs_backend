import { Request, Response, NextFunction } from 'express';
import { KcdApiKey } from '../models/KcdApiKey';
import { User } from '../models/User';

export interface AuthenticatedKcdRequest extends Request {
  kcdApiKey?: any;
  courierCode?: string;
}

// Generate API key
export const generateApiKey = (): string => {
  const prefix = 'kcd_live_';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + result;
};

// Authenticate KCD API key
export const authKcdApiKey = async (
  req: AuthenticatedKcdRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header'
      });
      return;
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Find API key in database
    const kcdKey = await KcdApiKey.findOne({
      apiKey,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('createdBy');

    if (!kcdKey) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired API key'
      });
      return;
    }

    // Update usage statistics
    kcdKey.lastUsed = new Date();
    kcdKey.usageCount += 1;
    await kcdKey.save();

    // Attach API key info to request
    req.kcdApiKey = kcdKey;
    req.courierCode = kcdKey.courierCode;

    next();
  } catch (error) {
    console.error('KCD Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Log KCD API calls
export const logKcdApiCall = (
  req: AuthenticatedKcdRequest,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] KCD API Call: ${method} ${path} - IP: ${ip} - Agent: ${userAgent}`);
  
  if (req.courierCode) {
    console.log(`[${timestamp}] Courier Code: ${req.courierCode}`);
  }
  
  next();
};
