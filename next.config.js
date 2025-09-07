/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance Optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },

  // Image Optimization
  images: {
    domains: ['localhost', 'twilio.com', 'api.resend.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },

  // Environment Variables (explicit client injection)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    // NUCLEAR CACHE BUSTING - Force complete rebuild 
    BUILD_TIMESTAMP: '1757251829',
    DISABLE_OLD_AUTH: 'true',
    FORCE_REBUILD: 'complete-auth-cleanup-v3',
    VERCEL_FORCE_REBUILD: 'auth-system-v3-final',
  },

  // Experimental Features for Performance
  experimental: {
    serverComponentsExternalPackages: [
      'twilio',
      'openai',
      '@supabase/supabase-js',
    ],
    optimizePackageImports: [
      '@nextui-org/react',
      'framer-motion',
      'lodash',
      'date-fns',
    ],
  },

  // Headers for Security and Performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://api.openai.com https://api.twilio.com https://api.resend.com https://api.stripe.com https://fonts.googleapis.com https://fonts.gstatic.com; frame-src 'self' https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects and Rewrites
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
