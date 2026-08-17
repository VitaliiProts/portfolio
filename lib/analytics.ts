import { trackAmplitude } from './amplitude';
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
  | 'pricing_teen_pair'
  | 'test_result';

function normalizeAdsId(value: string | undefined): string | undefined {
  const id = value?.trim();
  if (!id) return undefined;
  return /^\d+$/.test(id) ? `AW-${id}` : id;
}

export const googleAdsId = normalizeAdsId(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);
export const googleAdsConversionLabel =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() || undefined;
export const ga4Id = process.env.NEXT_PUBLIC_GA4_ID?.trim() || undefined;
const conversionCurrency = 'UAH';

/**
 * Очікувана цінність ліда, а не ціна консультації: клік у Telegram — це
 * потенційна покупка, а не оплата. Якби ми надсилали повні 1600 ₴, Smart
 * Bidding вважав би дохід завищеним у кілька разів і переплачував за клік.
 *
 * Тому ціна множиться на частку лідів, які доходять до оплати. Заявка з формою
 * сильніша за клік по кнопці (людина вже лишила ім'я та контакт), а клік по
 * Instagram — найслабший сигнал: там ще немає навіть початку розмови.
 *
 * Частки — стартова оцінка. Коли набереться власна статистика, підставляємо
 * реальні числа.
 */
const leadValue = {
  form: Math.round(prices.individual * 0.3),
  telegram: Math.round(prices.individual * 0.2),
  instagram: Math.round(prices.individual * 0.05),
} as const;

/**
 * Одна дія-конверсія в Google Ads на всі канали, тому розділяємо їх лише для
 * захисту від дублів: кліки по Telegram і по Instagram рахуються незалежно.
 */
type ConversionChannel = 'telegram' | 'instagram';

/**
 * Google Ads рахує кожен виклик gtag('event','conversion') окремо, а кнопку
 * легко натиснути п'ять разів підряд. Тому один канал дає щонайбільше одну
 * конверсію на сесію вкладки.
 */
function isFirstConversionInSession(channel: ConversionChannel): boolean {
  const key = `ads-conversion-sent:${channel}`;

  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
    return true;
  } catch {
    // Приватний режим або заблоковане сховище: краще порахувати конверсію
    // двічі, ніж втратити її зовсім.
    return true;
  }
}

function sendAdsConversion(channel: ConversionChannel, value: number): void {
  if (!googleAdsId || !googleAdsConversionLabel) return;
  if (!window.gtag) return;
  if (!isFirstConversionInSession(channel)) return;

  window.gtag('event', 'conversion', {
    send_to: `${googleAdsId}/${googleAdsConversionLabel}`,
    value,
    currency: conversionCurrency,
  });
}

export function trackTelegramClick(source: TelegramCtaSource): void {
  const value = source === 'form' ? leadValue.form : leadValue.telegram;

  sendAdsConversion('telegram', value);

  // Без дедуплікації: у продуктовій аналітиці потрібні всі кліки, а не лише
  // перший, інакше не видно, скільки разів людина вагалася.
  window.gtag?.('event', 'telegram_click', {
    cta_source: source,
    value,
    currency: conversionCurrency,
  });

  trackAmplitude('Clicked Telegram CTA', { 'CTA Source': source });
}

export function trackTestStarted(slug: string): void {
  window.gtag?.('event', 'test_started', { test: slug });
  trackAmplitude('Started Test', { Test: slug });
}

/**
 * Відповіді не залишають браузер: у подію йде лише діапазон результату
 * («помірний рівень»), а для багатошкальних тестів — діапазон кожної шкали.
 */
export function trackTestCompleted(slug: string, bands: Record<string, string>): void {
  window.gtag?.('event', 'test_completed', { test: slug, ...bands });
  trackAmplitude('Completed Test', { Test: slug, ...bands });
}

export function trackInstagramClick(): void {
  sendAdsConversion('instagram', leadValue.instagram);

  window.gtag?.('event', 'instagram_click', {
    value: leadValue.instagram,
    currency: conversionCurrency,
  });

  trackAmplitude('Clicked Instagram');
}
