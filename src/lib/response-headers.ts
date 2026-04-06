import { cookies, headers } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to apply cache headers to responses
 */
export function withCacheHeaders(
  response: NextResponse,
  strategy: 'static' | 'dynamic' | 'user-data' | 'repository' | 'no-cache'
): NextResponse {
  const cacheConfig = {
    static: {
      'Cache-Control': 'public, s-maxage=86400, max-age=86400, stale-while-revalidate=604800',
      'CDN-Cache-Control': 'max-age=86400',
    },
    dynamic: {
      'Cache-Control': 'public, s-maxage=3600, max-age=300, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'max-age=3600',
    },
    'user-data': {
      'Cache-Control': 'private, s-maxage=300, max-age=60, stale-while-revalidate=3600',
    },
    repository: {
      'Cache-Control': 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800',
      'CDN-Cache-Control': 'max-age=86400',
    },
    'no-cache': {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  };

  const headers = cacheConfig[strategy];
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Check if request has valid cache (for client-side cache validation)
 */
export function isCacheValid(
  cachedAt: number,
  maxAgeSeconds: number
): boolean {
  const now = Date.now();
  return now - cachedAt < maxAgeSeconds * 1000;
}

/**
 * Generate ETag for response
 */
export function generateETag(content: string): string {
  const crypto = require('crypto');
  return `"${crypto
    .createHash('md5')
    .update(content)
    .digest('hex')}"`;
}
