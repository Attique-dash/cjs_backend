import { Request } from 'express';
import crypto from 'crypto';

/** Placeholder values Askenish/KCD send in sample payloads — not real tokens */
const TOKEN_PLACEHOLDERS = new Set([
  '<api-token>',
  '<API-TOKEN>',
  'api-token',
  'your-api-token',
  'your_api_token',
  '<token>',
  'undefined',
  'null',
]);

export function isRealApiToken(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const t = value.trim();
  if (!t || t.length < 8) return false;
  if (TOKEN_PLACEHOLDERS.has(t)) return false;
  if (TOKEN_PLACEHOLDERS.has(t.toLowerCase())) return false;
  return true;
}

export type KcdTokenSource =
  | 'query.id'
  | 'query.apiKey'
  | 'header.authorization'
  | 'header.x-kcd-api-key'
  | 'header.x-api-key'
  | 'body.APIToken'
  | 'body.apiToken'
  | 'body.token';

export type KcdTokenCandidate = {
  source: KcdTokenSource;
  token: string;
};

function tokenFromBody(body: unknown): KcdTokenCandidate[] {
  const found: KcdTokenCandidate[] = [];
  if (!body) return found;

  const items: Record<string, unknown>[] = [];
  if (Array.isArray(body)) {
    for (const item of body) {
      if (item && typeof item === 'object') {
        items.push(item as Record<string, unknown>);
      }
    }
  } else if (typeof body === 'object') {
    items.push(body as Record<string, unknown>);
  }

  for (const item of items) {
    const pairs: Array<[KcdTokenSource, unknown]> = [
      ['body.APIToken', item.APIToken],
      ['body.apiToken', item.apiToken],
      ['body.token', item.token],
    ];
    for (const [source, raw] of pairs) {
      if (isRealApiToken(raw)) {
        found.push({ source, token: String(raw).trim() });
      }
    }
  }
  return found;
}

/**
 * Collect API token from all KCD-supported locations.
 * Headers/query win over body so sample APIToken "<API-TOKEN>" does not override x-api-key.
 */
export function collectKcdTokenCandidates(req: Request): KcdTokenCandidate[] {
  const candidates: KcdTokenCandidate[] = [];

  const queryId = req.query?.id;
  if (typeof queryId === 'string' && isRealApiToken(queryId)) {
    candidates.push({ source: 'query.id', token: queryId.trim() });
  }
  const queryApiKey = req.query?.apiKey ?? req.query?.api_key;
  if (typeof queryApiKey === 'string' && isRealApiToken(queryApiKey)) {
    candidates.push({ source: 'query.apiKey', token: queryApiKey.trim() });
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.trim()) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (isRealApiToken(token)) {
      candidates.push({ source: 'header.authorization', token });
    }
  }

  const xKcd = req.headers['x-kcd-api-key'];
  if (typeof xKcd === 'string' && isRealApiToken(xKcd)) {
    candidates.push({ source: 'header.x-kcd-api-key', token: xKcd.trim() });
  }

  const xApi = req.headers['x-api-key'];
  if (typeof xApi === 'string' && isRealApiToken(xApi)) {
    candidates.push({ source: 'header.x-api-key', token: xApi.trim() });
  }

  candidates.push(...tokenFromBody(req.body));

  return candidates;
}

export function extractKcdToken(req: Request): {
  token: string | null;
  candidates: KcdTokenCandidate[];
  rejectedPlaceholders: string[];
} {
  const rejectedPlaceholders: string[] = [];
  const body = req.body;

  const checkPlaceholder = (raw: unknown, label: string) => {
    if (typeof raw !== 'string') return;
    const trimmed = raw.trim();
    if (trimmed && !isRealApiToken(trimmed)) {
      rejectedPlaceholders.push(`${label} (${trimmed.slice(0, 24)}…)`);
    }
  };

  if (Array.isArray(body)) {
    for (const item of body) {
      if (item && typeof item === 'object') {
        const row = item as Record<string, unknown>;
        checkPlaceholder(row.APIToken, 'body.APIToken');
        checkPlaceholder(row.apiToken, 'body.apiToken');
        checkPlaceholder(row.token, 'body.token');
      }
    }
  } else if (body && typeof body === 'object') {
    const row = body as Record<string, unknown>;
    checkPlaceholder(row.APIToken, 'body.APIToken');
    checkPlaceholder(row.apiToken, 'body.apiToken');
    checkPlaceholder(row.token, 'body.token');
  }

  const candidates = collectKcdTokenCandidates(req);
  const token = candidates.length > 0 ? candidates[0].token : null;

  return { token, candidates, rejectedPlaceholders };
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
