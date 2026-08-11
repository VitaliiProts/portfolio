import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { Amplitude } from '@/components/Amplitude';
import { CrisisBar } from '@/components/CrisisBar';
import { Footer } from '@/components/Footer';
import { GoogleTag } from '@/components/GoogleTag';
import { Header } from '@/components/Header';
import { JsonLd } from '@/components/JsonLd';
import { StickyCta } from '@/components/StickyCta';
import { formatPrice, prices, site } from '@/lib/site';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400'],
  display: 'swap',
  variable: '--font-display',
});

const body = Jost({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-body',
});

const priceFrom = formatPrice(prices.individual);

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Психолог з РХП — терапія анорексії, булімії, тривоги | ${site.shortName}`,
    template: `%s | ${site.shortName}`,
  },
  description: `Запис до психолога з РХП від ${priceFrom}. Терапія анорексії, булімії, переїдання, тривоги та панічних атак. Онлайн і в Києві. Конфіденційно. Відповідь у Telegram протягом дня.`,
  keywords: [
    'психолог РХП',
    'психолог Київ',
    'розлади харчової поведінки',
    'анорексія терапія',
    'булімія психолог',
    'компульсивне переїдання',
    'панічні атаки',
    'тривога психолог',
    'психотерапія онлайн',
    site.shortName,
  ],
  authors: [{ name: site.shortName, url: site.url }],
  creator: site.shortName,
  publisher: site.shortName,
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `Психолог з РХП — ${site.shortName} | від ${priceFrom}`,
    description:
      'Терапія РХП, тривоги та панічних атак. Онлайн і Київ. Конфіденційно. Запис у Telegram.',
    images: [
      {
        url: site.ogImage,
        width: 933,
        height: 1400,
        alt: `Психолог ${site.shortName} — фахівець з РХП`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Психолог з РХП — ${site.shortName} | від ${priceFrom}`,
    description: 'Терапія РХП, тривоги та панічних атак. Онлайн і Київ. Запис у Telegram.',
    images: [site.ogImage],
  },
  icons: {
    icon: site.ogImage,
    apple: site.ogImage,
  },
  category: 'health',
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.lang} className={`${display.variable} ${body.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://t.me" />
        <link rel="dns-prefetch" href="https://www.instagram.com" />
      </head>
      {/* Розширення браузера дописують атрибути до <body> до гідратації. */}
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main">
          Перейти до вмісту
        </a>
        <Header />
        <main id="main">{children}</main>
        <StickyCta />
        <Footer />
        <CrisisBar />
        <JsonLd />
        <GoogleTag />
        <Amplitude />
        <Analytics />
      </body>
    </html>
  );
}
