import Script from 'next/script';
import { ga4Id, googleAdsId } from '@/lib/analytics';

/**
 * ЄЕЗ + Велика Британія та Швейцарія: там показ реклами без згоди заборонений.
 * Для решти світу (зокрема України) згода за замовчуванням надана, інакше
 * Google Ads недорахує конверсії.
 */
const consentRequiredRegions = [
  'AT', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES',
  'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LI',
  'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE',
  'SI', 'SK',
];

const grantedByDefault = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
};

const deniedInConsentRegions = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
  region: consentRequiredRegions,
};

/**
 * Google tag для GA4 і Google Ads.
 *
 * Consent Mode v2 має бути виставлений до завантаження gtag.js, тому бутстрап
 * іде як beforeInteractive, а сама бібліотека — afterInteractive, щоб не
 * псувати LCP на мобільних.
 */
export function GoogleTag() {
  const measurementIds = [ga4Id, googleAdsId].filter(Boolean) as string[];
  if (measurementIds.length === 0) return null;

  const bootstrap = [
    'window.dataLayer = window.dataLayer || [];',
    'function gtag(){dataLayer.push(arguments);}',
    'window.gtag = gtag;',
    `gtag('consent','default',${JSON.stringify(grantedByDefault)});`,
    `gtag('consent','default',${JSON.stringify(deniedInConsentRegions)});`,
    "gtag('set','url_passthrough',true);",
    "gtag('set','ads_data_redaction',true);",
    "gtag('js',new Date());",
  ].join('\n');

  const config = measurementIds.map((id) => `gtag('config','${id}');`).join('\n');

  return (
    <>
      {/* Інлайн, а не next/script: Consent Mode має бути виставлений під час
          парсингу HTML — раніше, ніж завантажиться gtag.js. */}
      <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      <Script
        id="google-tag"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementIds[0]}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-config" strategy="afterInteractive">
        {config}
      </Script>
    </>
  );
}
