import type { NextConfig } from 'next';
import { canonicalHost, sectionIds } from './lib/site';

/**
 * Канонічний хост разом з apex-версією, яка на нього редиректить. Патерн
 * будуємо від apex, бо `canonicalHost` уже містить `www.` — інакше вийшло б
 * `(www\.)?www\.psykristel\.com` і apex помилково потрапляв би під noindex.
 */
const apexHost = canonicalHost.replace(/^www\./, '');
const knownHostPattern = `(www\\.)?${apexHost.replace(/\./g, '\\.')}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return sectionIds.map((id) => ({ source: `/${id}`, destination: '/' }));
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
        missing: [{ type: 'host', value: knownHostPattern }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
