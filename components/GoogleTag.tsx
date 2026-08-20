import { ga4Id, googleAdsId } from '@/lib/analytics';
import { GoogleTagLoader } from './GoogleTagLoader';

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
 * Consent Mode v2 і конфігурація потоків мають бути виставлені до того, як
 * gtag.js розбере чергу, тому весь бутстрап іде інлайном під час парсингу HTML.
 * Сама бібліотека (~150 КБ) чекає на першу взаємодію: інакше вона з'їдає
 * головний потік одразу після першого екрана.
 */
export function GoogleTag() {
  const measurementIds = [googleAdsId, ga4Id].filter(Boolean) as string[];
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
    ...measurementIds.map((id) => `gtag('config','${id}');`),
  ].join('\n');

  return (
    <>
      {/* Інлайн, а не next/script: черга в dataLayer має бути наповнена під час
          парсингу HTML — раніше, ніж завантажиться gtag.js. */}
      <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      <GoogleTagLoader
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementIds[0]}`}
      />
    </>
  );
}
