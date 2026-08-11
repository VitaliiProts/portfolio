/**
 * Відстеження єдиної конверсії сайту — переходу в Telegram.
 * Форми з відправкою на сервер немає, тому клік по CTA і є цільовою дією
 * для Google Ads, GA4 та Amplitude.
 */

import * as amplitude from '@amplitude/unified';
import { prices } from './site';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Кожна кнопка має власне джерело: у Google Ads конверсія лишається однією
 * (щоб не розмивати сигнал для Smart Bidding), а розбивку по кнопках дає
 * параметр cta_source у GA4 та Amplitude.
 */
export type TelegramCtaSource =
  | 'hero'
  | 'header'
  | 'sticky'
  | 'contact'
  | 'social'
  | 'form'
  | 'pricing_individual'
  | 'pricing_eating_disorder'
  | 'pricing_teen_pair';

export const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
export const googleAdsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
export const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;

/**
 * Вартість конверсії для Google Ads. Це не оплачена сесія, а перехід у Telegram,
 * але однакове значення на всіх кнопках дозволяє алгоритму рахувати ROAS.
 */
const conversionValue = prices.individual;
const conversionCurrency = 'UAH';

export function trackTelegramClick(source: TelegramCtaSource): void {
  const { gtag } = window;

  if (gtag) {
    if (googleAdsId && googleAdsConversionLabel) {
      gtag('event', 'conversion', {
        send_to: `${googleAdsId}/${googleAdsConversionLabel}`,
        value: conversionValue,
        currency: conversionCurrency,
      });
    }

    gtag('event', 'telegram_click', {
      cta_source: source,
      value: conversionValue,
      currency: conversionCurrency,
    });
  }

  amplitude.track('Clicked Telegram CTA', { cta_source: source });
}
