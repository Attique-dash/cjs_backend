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
    // Handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Get headers (case-insensitive)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const apiKeyHeader = req.headers['x-api-key'] || req.headers['X-API-Key'] || req.headers['X-Api-Key'];
    
    // Allow both Bearer token and X-API-Key header for flexibility
    let apiKey: string | null = null;
    
    if (authHeader) {
      // Handle Bearer token (case-insensitive)
      const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
      if (bearerMatch) {
        apiKey = bearerMatch[1].trim();
      } else {
        // If no Bearer prefix, treat the whole header as the key
        apiKey = authHeader.trim();
      }
    } else if (apiKeyHeader) {
      apiKey = typeof apiKeyHeader === 'string' ? apiKeyHeader.trim() : String(apiKeyHeader).trim();
    }
    
    if (!apiKey || apiKey.length === 0) {
      console.error('KCD API Authentication failed: No API key provided', {
        method: req.method,
        path: req.path,
        headers: {
          hasAuth: !!authHeader,
          hasApiKey: !!apiKeyHeader,
          authHeader: authHeader ? '***' : undefined,
          apiKeyHeader: apiKeyHeader ? '***' : undefined
        }
      });
      res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header. Use Bearer <token> or X-API-Key header'
      });
      return;
    }

    // Find API key in database
    const kcdKey = await KcdApiKey.findOne({
      apiKey: apiKey.trim(),
      isActive: true
    }).populate('createdBy');

    if (!kcdKey) {
      console.error('KCD API Authentication failed: API key not found', {
        method: req.method,
        path: req.path,
        apiKeyPrefix: apiKey.substring(0, 10) + '...'
      });
      res.status(401).json({
        success: false,
        message: 'Invalid or inactive API key. Please verify your API key is correct and active.'
      });
      return;
    }

    // Check if key has expired
    if (kcdKey.expiresAt && kcdKey.expiresAt < new Date()) {
      console.error('KCD API Authentication failed: API key expired', {
        method: req.method,
        path: req.path,
        expiresAt: kcdKey.expiresAt,
        courierCode: kcdKey.courierCode
      });
      res.status(401).json({
        success: false,
        message: 'API key has expired. Please generate a new API key.'
      });
      return;
    }

    // Update usage statistics
    kcdKey.lastUsed = new Date();
    kcdKey.usageCount = (kcdKey.usageCount || 0) + 1;
    await kcdKey.save();

    // Attach API key info to request
    req.kcdApiKey = kcdKey;
    req.courierCode = kcdKey.courierCode;

    console.log('KCD API Authentication successful', {
      method: req.method,
      path: req.path,
      courierCode: kcdKey.courierCode,
      usageCount: kcdKey.usageCount
    });

    next();
  } catch (error) {
    console.error('KCD Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again later.'
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
