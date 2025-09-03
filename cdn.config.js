// Flynn.ai v2 - CDN Configuration for Production
// This file contains CDN and caching strategies for optimal performance

const CDN_CONFIG = {
  // Static Asset Caching Strategy
  staticAssets: {
    // Long-term caching for immutable assets
    immutable: {
      pattern: '/_next/static/**',
      cacheControl: 'public, max-age=31536000, immutable',
      description: 'Next.js static assets (JS, CSS, images)'
    },
    
    // Media assets with versioning
    media: {
      pattern: '/static/**/*.{png,jpg,jpeg,gif,webp,avif,svg,ico}',
      cacheControl: 'public, max-age=31536000',
      description: 'Images and media files'
    },
    
    // Fonts with long caching
    fonts: {
      pattern: '/fonts/**/*.{woff,woff2,ttf,otf}',
      cacheControl: 'public, max-age=31536000, crossorigin',
      description: 'Web fonts'
    }
  },

  // API Response Caching
  apiCaching: {
    // Short-lived user data
    userConfig: {
      pattern: '/api/user/**',
      cacheControl: 'private, max-age=300',
      description: 'User configuration and settings'
    },
    
    // Industry configurations
    industryConfig: {
      pattern: '/api/industry/**',
      cacheControl: 'public, max-age=3600',
      description: 'Industry-specific configurations'
    },
    
    // Health checks
    health: {
      pattern: '/api/performance/health',
      cacheControl: 'public, max-age=60',
      description: 'System health status'
    },
    
    // Analytics data
    analytics: {
      pattern: '/api/analytics/**',
      cacheControl: 'private, max-age=300',
      description: 'User analytics and metrics'
    }
  },

  // Page Caching Strategy
  pageCache: {
    // Landing page
    home: {
      pattern: '/',
      cacheControl: 'public, max-age=3600, stale-while-revalidate=86400',
      description: 'Home page with ISR'
    },
    
    // Authentication pages
    auth: {
      pattern: '/(login|register|logout)',
      cacheControl: 'private, no-cache, no-store, must-revalidate',
      description: 'Auth pages should not be cached'
    },
    
    // Protected dashboard
    dashboard: {
      pattern: '/dashboard/**',
      cacheControl: 'private, no-cache, no-store, must-revalidate',
      description: 'Protected dashboard pages'
    },
    
    // Support and help pages
    support: {
      pattern: '/support/**',
      cacheControl: 'public, max-age=1800, stale-while-revalidate=3600',
      description: 'Support documentation'
    }
  },

  // CDN Edge Locations
  edgeLocations: {
    primary: ['iad1', 'sfo1', 'lhr1'], // US East, West, London
    secondary: ['fra1', 'sin1', 'syd1'], // Frankfurt, Singapore, Sydney
    description: 'Vercel Edge Network locations for optimal global performance'
  },

  // Performance Optimizations
  performance: {
    // Image optimization
    images: {
      formats: ['avif', 'webp', 'jpeg'],
      sizes: [640, 828, 1200, 1920, 3840],
      quality: 85,
      minimumCacheTTL: 3600
    },
    
    // JavaScript optimizations
    javascript: {
      minification: true,
      compression: 'gzip',
      splitting: true,
      treeshaking: true
    },
    
    // CSS optimizations
    css: {
      minification: true,
      purging: true,
      compression: 'gzip',
      inlining: 'critical'
    }
  },

  // Security Headers for CDN
  securityHeaders: {
    'Content-Security-Policy': {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com",
      'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
      'font-src': "'self' https://fonts.gstatic.com",
      'img-src': "'self' data: https: blob:",
      'connect-src': "'self' https://*.supabase.co https://api.openai.com https://api.twilio.com https://api.resend.com https://api.stripe.com",
      'frame-src': "'self' https://js.stripe.com",
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'"
    },
    
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },

  // Monitoring and Analytics
  monitoring: {
    realUserMetrics: {
      enabled: true,
      provider: 'vercel-analytics',
      metrics: ['FCP', 'LCP', 'CLS', 'FID', 'TTFB']
    },
    
    errorTracking: {
      enabled: true,
      provider: 'sentry',
      sampleRate: 0.1
    },
    
    performanceBudget: {
      javascript: '500kb',
      css: '100kb',
      images: '2mb',
      fonts: '200kb',
      total: '3mb'
    }
  }
};

// Export for use in other configuration files
module.exports = CDN_CONFIG;

// Helper functions for cache control headers
const getCacheControlHeader = (type, category) => {
  return CDN_CONFIG[type]?.[category]?.cacheControl || 'no-cache';
};

const getPerformanceConfig = () => {
  return CDN_CONFIG.performance;
};

const getSecurityHeaders = () => {
  return CDN_CONFIG.securityHeaders;
};

module.exports.getCacheControlHeader = getCacheControlHeader;
module.exports.getPerformanceConfig = getPerformanceConfig;
module.exports.getSecurityHeaders = getSecurityHeaders;