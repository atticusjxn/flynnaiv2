import { NextRequest, NextResponse } from 'next/server';

export interface CacheConfig {
  maxAge: number; // seconds
  staleWhileRevalidate?: number; // seconds
  sMaxAge?: number; // seconds for shared caches (CDN)
  revalidate?: boolean;
  tags?: string[];
  vary?: string[];
}

/**
 * Advanced caching utility for Next.js API routes and pages
 */
export class CacheManager {
  private static cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private static readonly maxCacheSize = 1000;

  /**
   * Generate cache key from request
   */
  static generateCacheKey(
    request: NextRequest,
    additionalKeys?: string[]
  ): string {
    const url = new URL(request.url);
    const baseKey = `${request.method}-${url.pathname}-${url.search}`;

    if (additionalKeys?.length) {
      return `${baseKey}-${additionalKeys.join('-')}`;
    }

    return baseKey;
  }

  /**
   * Get cached response
   */
  static get(key: string): any | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.timestamp + cached.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cached response
   */
  static set(key: string, data: any, ttlSeconds: number = 300): void {
    // Prevent memory leaks by limiting cache size
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds,
    });
  }

  /**
   * Invalidate cache by pattern
   */
  static invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  static getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Cache response with appropriate headers
 */
export function cacheResponse(
  response: NextResponse,
  config: CacheConfig
): NextResponse {
  const cacheControl = [
    `max-age=${config.maxAge}`,
    config.sMaxAge && `s-maxage=${config.sMaxAge}`,
    config.staleWhileRevalidate &&
      `stale-while-revalidate=${config.staleWhileRevalidate}`,
    config.revalidate === false && 'no-revalidate',
  ]
    .filter(Boolean)
    .join(', ');

  response.headers.set('Cache-Control', cacheControl);

  if (config.vary?.length) {
    response.headers.set('Vary', config.vary.join(', '));
  }

  if (config.tags?.length) {
    response.headers.set('Cache-Tag', config.tags.join(','));
  }

  return response;
}

/**
 * HOF for caching API responses
 */
export function withCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: CacheConfig
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const cacheKey = CacheManager.generateCacheKey(req);

    // Try to get from cache first
    const cached = CacheManager.get(cacheKey);
    if (cached) {
      const response = NextResponse.json(cached);
      response.headers.set('X-Cache', 'HIT');
      return cacheResponse(response, config);
    }

    // Execute handler
    const response = await handler(req);

    // Cache successful responses
    if (response.status === 200) {
      const responseData = await response.json();
      CacheManager.set(cacheKey, responseData, config.maxAge);

      // Return cached response with appropriate headers
      const cachedResponse = NextResponse.json(responseData);
      cachedResponse.headers.set('X-Cache', 'MISS');
      return cacheResponse(cachedResponse, config);
    }

    return response;
  };
}

/**
 * Conditional caching based on user authentication
 */
export function withConditionalCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: {
    authenticatedCache: CacheConfig;
    anonymousCache: CacheConfig;
  }
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const isAuthenticated = req.headers
      .get('authorization')
      ?.startsWith('Bearer ');
    const cacheConfig = isAuthenticated
      ? config.authenticatedCache
      : config.anonymousCache;

    return withCache(handler, cacheConfig)(req);
  };
}

/**
 * Rate-limited caching for expensive operations
 */
export class RateLimitedCache {
  private static rateLimits = new Map<
    string,
    { count: number; resetTime: number }
  >();

  static checkRateLimit(
    identifier: string,
    limit: number = 100,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const window = this.rateLimits.get(identifier);

    if (!window || now > window.resetTime) {
      // New window
      this.rateLimits.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
    }

    if (window.count >= limit) {
      return { allowed: false, remaining: 0, resetTime: window.resetTime };
    }

    window.count++;
    return {
      allowed: true,
      remaining: limit - window.count,
      resetTime: window.resetTime,
    };
  }
}

/**
 * Cache warming utility
 */
export class CacheWarmer {
  static async warmCache(routes: string[], baseUrl: string): Promise<void> {
    const promises = routes.map(async (route) => {
      try {
        const response = await fetch(`${baseUrl}${route}`, {
          headers: { 'X-Cache-Warm': 'true' },
        });
        console.log(`✓ Warmed cache for ${route} (${response.status})`);
      } catch (error) {
        console.warn(`⚠ Failed to warm cache for ${route}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  static getCommonRoutes(): string[] {
    return [
      '/api/performance/health',
      '/api/calls?limit=20',
      '/api/performance/analytics?timeRange=3600',
    ];
  }
}
