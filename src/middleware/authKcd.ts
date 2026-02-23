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

    // Get headers (case-insensitive) - normalize to string
    const authHeaderRaw = req.headers.authorization || req.headers.Authorization;
    const apiKeyHeaderRaw = req.headers['x-api-key'] || req.headers['X-API-Key'] || req.headers['X-Api-Key'];
    const kcdApiKeyHeaderRaw = req.headers['x-kcd-api-key'] || req.headers['X-KCD-API-Key'];
    
    // Convert headers to string (handle array case by taking first element)
    const authHeader = authHeaderRaw 
      ? (Array.isArray(authHeaderRaw) ? authHeaderRaw[0] : authHeaderRaw)
      : null;
    const apiKeyHeader = apiKeyHeaderRaw
      ? (Array.isArray(apiKeyHeaderRaw) ? apiKeyHeaderRaw[0] : apiKeyHeaderRaw)
      : null;
    const kcdApiKeyHeader = kcdApiKeyHeaderRaw
      ? (Array.isArray(kcdApiKeyHeaderRaw) ? kcdApiKeyHeaderRaw[0] : kcdApiKeyHeaderRaw)
      : null;
    
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
    } else if (kcdApiKeyHeader) {
      // Prioritize X-KCD-API-Key for KCD endpoints
      apiKey = kcdApiKeyHeader.trim();
    } else if (apiKeyHeader) {
      // Fallback to X-API-Key for backward compatibility
      apiKey = apiKeyHeader.trim();
    }
    
    if (!apiKey || apiKey.length === 0) {
      console.error('KCD API Authentication failed: No API key provided', {
        method: req.method,
        path: req.path,
        headers: {
          hasAuth: !!authHeader,
          hasApiKey: !!apiKeyHeader,
          hasKcdApiKey: !!kcdApiKeyHeader,
          authHeader: authHeader ? '***' : undefined,
          apiKeyHeader: apiKeyHeader ? '***' : undefined,
          kcdApiKeyHeader: kcdApiKeyHeader ? '***' : undefined
        }
      });
      res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header. Please provide a valid KCD API key.',
        error: 'Missing API key',
        hint: 'Include either: Authorization: Bearer <your-api-key> OR X-KCD-API-Key: <your-api-key> OR X-API-Key: <your-api-key>',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Find API key in database (first check if it exists at all, then check if active)
    const trimmedKey = apiKey.trim();
    const kcdKeyRecord = await KcdApiKey.findOne({
      apiKey: trimmedKey
    }).populate('createdBy');

    // If key doesn't exist at all
    if (!kcdKeyRecord) {
      console.error('KCD API Authentication failed: API key not found in database', {
        method: req.method,
        path: req.path,
        apiKeyPrefix: trimmedKey.substring(0, 15) + '...',
        keyLength: trimmedKey.length
      });
      res.status(401).json({
        success: false,
        message: 'Invalid or inactive API key. Please verify your API key is correct and active.',
        error: 'API key not found',
        hint: 'The API key does not exist in the database. Generate a new key via POST /api/admin/api-keys/kcd'
      });
      return;
    }

    // If key exists but is inactive
    if (!kcdKeyRecord.isActive) {
      console.error('KCD API Authentication failed: API key is inactive', {
        method: req.method,
        path: req.path,
        apiKeyId: kcdKeyRecord._id,
        courierCode: kcdKeyRecord.courierCode,
        deactivatedAt: kcdKeyRecord.deactivatedAt
      });
      res.status(401).json({
        success: false,
        message: 'Invalid or inactive API key. Please verify your API key is correct and active.',
        error: 'API key is inactive',
        hint: 'This API key has been deactivated. Generate a new key via POST /api/admin/api-keys/kcd or reactivate it via PUT /api/admin/api-keys/:keyId/activate'
      });
      return;
    }

    // Key exists and is active, use it
    const kcdKey = kcdKeyRecord;

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
        message: 'API key has expired. Please generate a new API key.',
        error: 'API key expired',
        hint: 'Generate a new key via POST /api/admin/api-keys/kcd'
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
