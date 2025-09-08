import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MinimalAuthProvider } from '@/components/MinimalAuthProvider';
import { NextUIProvider } from '@/components/NextUIProvider';
import PWARegister from '@/components/PWARegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flynn.ai v2 - AI-Powered Call to Calendar',
  description:
    'Transform business phone calls into organized calendar events within 2 minutes. AI-powered automation for professionals across all industries.',
  keywords: [
    'AI',
    'call processing',
    'calendar automation',
    'business phone calls',
    'appointment scheduling',
    'CRM integration',
    'voice transcription',
    'event extraction',
  ],
  authors: [{ name: 'Flynn.ai Team' }],
  creator: 'Flynn.ai',
  publisher: 'Flynn.ai',
  applicationName: 'Flynn.ai v2',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  category: 'business',
  classification: 'Business Software',

  // Open Graph
  openGraph: {
    title: 'Flynn.ai v2 - AI-Powered Call to Calendar',
    description:
      'Transform business phone calls into organized calendar events within 2 minutes',
    url: 'https://flynn.ai',
    siteName: 'Flynn.ai',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/icons/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Flynn.ai - AI-Powered Call to Calendar',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Flynn.ai v2 - AI-Powered Call to Calendar',
    description:
      'Transform business phone calls into organized calendar events within 2 minutes',
    creator: '@flynnai',
    images: ['/icons/og-image.png'],
  },

  // PWA
  manifest: '/manifest.json',

  // iOS
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Flynn.ai',
    startupImage: [
      {
        url: '/icons/apple-startup-828x1792.png',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-startup-1125x2436.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/apple-startup-1242x2688.png',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },

  // Other
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4880ff' },
    { media: '(prefers-color-scheme: dark)', color: '#4880ff' },
  ],
  colorScheme: 'light',
};

// FINAL AUTH FIX: Force complete bundle rebuild - v4.0 - 2025-01-08
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="w-full">
      <head>
        {/* PWA iOS Icons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-192x192.png"
        />
        <link rel="mask-icon" href="/icons/icon-192x192.png" color="#4880ff" />

        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#4880ff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Preload critical resources */}
        <link rel="preload" href="/sw.js" as="script" />
      </head>
      <body className={`${inter.className} w-full min-h-screen m-0 p-0`}>
        <NextUIProvider>
          <MinimalAuthProvider>
            {children}
            <PWARegister />
          </MinimalAuthProvider>
        </NextUIProvider>
      </body>
    </html>
  );
}
