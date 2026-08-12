import * as amplitude from '@amplitude/unified';
import { prices } from './site';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
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

function normalizeAdsId(value: string | undefined): string | undefined {
  const id = value?.trim();
  if (!id) return undefined;
  return /^\d+$/.test(id) ? `AW-${id}` : id;
}

export const googleAdsId = normalizeAdsId(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);
export const googleAdsConversionLabel =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() || undefined;
export const ga4Id = process.env.NEXT_PUBLIC_GA4_ID?.trim() || undefined;
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

  amplitude.track('Clicked Telegram CTA', { 'CTA Source': source });
}

export function trackInstagramClick(): void {
  window.gtag?.('event', 'instagram_click');

  amplitude.track('Clicked Instagram');
}
