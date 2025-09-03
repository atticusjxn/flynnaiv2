// Flynn.ai v2 - Rate Limiting System
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
  onLimitReached?: (key: string, limit: RateLimitConfig) => void;
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store (for development) - use Redis in production
class MemoryStore {
  private store = new Map<string, RateLimitStore>();

  get(key: string): RateLimitStore | undefined {
    const entry = this.store.get(key);
    if (entry && Date.now() > entry.resetTime) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  set(key: string, value: RateLimitStore): void {
    this.store.set(key, value);
  }

  increment(key: string, windowMs: number): RateLimitStore {
    const now = Date.now();
    const existing = this.get(key);

    if (existing) {
      existing.count += 1;
      return existing;
    } else {
      const newEntry = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.set(key, newEntry);
      return newEntry;
    }
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  size(): number {
    return this.store.size;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Global store instance
const store = new MemoryStore();

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    store.cleanup();
  },
  5 * 60 * 1000
);

export class RateLimiter {
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      onLimitReached: config.onLimitReached || (() => {}),
    };
  }

  private defaultKeyGenerator(request: NextRequest): string {
    // Use IP address as default identifier
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';
    return `ip:${ip}`;
  }

  async checkLimit(request: NextRequest): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }> {
    const key = this.config.keyGenerator(request);
    const entry = store.increment(key, this.config.windowMs);

    const allowed = entry.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    const resetTime = new Date(entry.resetTime);

    if (!allowed) {
      this.config.onLimitReached(key, this.config);
    }

    return {
      allowed,
      limit: this.config.maxRequests,
      remaining,
      resetTime,
      retryAfter: allowed
        ? undefined
        : Math.ceil((entry.resetTime - Date.now()) / 1000),
    };
  }

  reset(request: NextRequest): void {
    const key = this.config.keyGenerator(request);
    store.reset(key);
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // Webhook endpoints - high volume, short window
  webhooks: new RateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 1000,
    keyGenerator: (req) => {
      // For webhooks, rate limit by endpoint + source
      const endpoint = req.nextUrl.pathname;
      const source = req.headers.get('user-agent') || 'unknown';
      return `webhook:${endpoint}:${source}`;
    },
  }),

  // AI processing endpoints - medium volume, longer window
  aiProcessing: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    keyGenerator: (req) => {
      // Rate limit by user for AI processing
      const userId = req.headers.get('x-user-id');
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
      return userId ? `user:${userId}:ai` : `ip:${ip}:ai`;
    },
  }),

  // User settings - low volume, medium window
  userSettings: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id');
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
      return userId ? `user:${userId}:settings` : `ip:${ip}:settings`;
    },
  }),

  // Authentication endpoints - very low volume, long window
  auth: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
      return `ip:${ip}:auth`;
    },
  }),

  // Onboarding endpoints - low volume
  onboarding: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id');
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
      return userId ? `user:${userId}:onboarding` : `ip:${ip}:onboarding`;
    },
  }),
};

// Middleware helper for Next.js API routes
export function withRateLimit(limiter: RateLimiter) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<Response>
  ): Promise<Response> {
    const result = await limiter.checkLimit(request);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: {
            message: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            details: {
              limit: result.limit,
              resetTime: result.resetTime.toISOString(),
              retryAfter: result.retryAfter,
            },
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toISOString(),
            'Retry-After': result.retryAfter?.toString() || '',
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = await handler(request);

    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString());

    return response;
  };
}

// Health check for rate limiter
export function getRateLimiterStats(): {
  storeSize: number;
  uptime: number;
} {
  return {
    storeSize: store.size(),
    uptime: process.uptime(),
  };
}

// Custom rate limiter for specific use cases
export function createCustomRateLimiter(
  windowMs: number,
  maxRequests: number,
  keyGenerator?: (request: NextRequest) => string
): RateLimiter {
  return new RateLimiter({
    windowMs,
    maxRequests,
    keyGenerator,
  });
}

// Rate limit configuration for different subscription tiers
export const tierLimits = {
  free: {
    aiProcessing: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 50 }, // 50 per day
    api: { windowMs: 60 * 60 * 1000, maxRequests: 100 }, // 100 per hour
  },
  basic: {
    aiProcessing: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 500 }, // 500 per day
    api: { windowMs: 60 * 60 * 1000, maxRequests: 1000 }, // 1000 per hour
  },
  professional: {
    aiProcessing: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 2000 }, // 2000 per day
    api: { windowMs: 60 * 60 * 1000, maxRequests: 5000 }, // 5000 per hour
  },
  enterprise: {
    aiProcessing: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10000 }, // 10000 per day
    api: { windowMs: 60 * 60 * 1000, maxRequests: 20000 }, // 20000 per hour
  },
};

// Get rate limiter for user tier
export function getRateLimiterForTier(
  tier: keyof typeof tierLimits,
  type: 'aiProcessing' | 'api'
): RateLimiter {
  const config = tierLimits[tier][type];
  return new RateLimiter({
    windowMs: config.windowMs,
    maxRequests: config.maxRequests,
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id');
      return userId
        ? `user:${userId}:${tier}:${type}`
        : `anonymous:${tier}:${type}`;
    },
  });
}
