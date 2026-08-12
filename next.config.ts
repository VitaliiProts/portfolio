import type { NextConfig } from 'next';
import { canonicalHost } from './lib/site';

/** Канонічний домен і його www-версія, яка редиректить на нього. */
const canonicalHostPattern = `(www\\.)?${canonicalHost.replace(/\./g, '\\.')}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        // Усе, що не канонічний домен (адреси *.vercel.app, прев'ю, майбутні
        // аліаси), лишається поза індексом — щоб у пошуку був один сайт.
        source: '/:path*',
        missing: [{ type: 'host', value: canonicalHostPattern }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
