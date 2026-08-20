/**
 * Єдине джерело правди для контактів, цін і зовнішніх посилань.
 * Змінюємо тут — оновлюється по всьому сайту, включно з JSON-LD і sitemap.
 */

/**
 * Єдиний хост, який має бути в індексі Google. Решта адрес (non-www, прев'ю та
 * службові домени Vercel) або редиректять сюди, або віддають X-Robots-Tag:
 * noindex — див. next.config.ts.
 */
export const canonicalHost = 'www.psykristel.com';

/**
 * Навмисно не підставляємо адресу деплою Vercel: canonical, sitemap і
 * Open Graph мають вести на канонічний домен навіть із прев'ю-деплоя.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || `https://${canonicalHost}`
).replace(/\/$/, '');

/** Пошуковикам відкритий лише продакшн; прев'ю-деплої лишаються поза індексом. */
export const isIndexable = (process.env.VERCEL_ENV ?? 'production') === 'production';

export const site = {
  url: siteUrl,
  canonicalHost,
  isIndexable,
  name: 'Крістель Кравець — психолог з РХП',
  shortName: 'Крістель Кравець',
  role: 'Психолог · РХП',
  jobTitle: 'Психолог, фахівець з розладів харчової поведінки',
  locale: 'uk_UA',
  lang: 'uk',
  themeColor: '#4A4F2D',
  ogImage: '/kristel-portrait.webp',
  telegramHandle: 'Krav_Kristel',
  telegramUrl: 'https://t.me/Krav_Kristel',
  instagramUrl: 'https://www.instagram.com/psy_kristel',
  crisisLine: '7333',
} as const;

export const prices = {
  individual: 1600,
  eatingDisorder: 1600,
  teenPair: 2000,
} as const;

/** Форматування ціни з нерозривним пробілом між тисячами: 1 600 ₴ */
export function formatPrice(value: number): string {
  return `${value.toLocaleString('uk-UA').replace(/\s/g, '\u00a0')}\u00a0₴`;
}

/** Telegram deep link із заздалегідь заповненим текстом повідомлення. */
export function telegramLink(text?: string): string {
  if (!text) return site.telegramUrl;
  return `${site.telegramUrl}?text=${encodeURIComponent(text)}`;
}

export const bookingLink = telegramLink('Вітаю, хочу записатися на консультацію');
export const freeConsultLink = telegramLink(
  'Вітаю, хочу записатися на безкоштовну 15-хвилинну консультацію',
);
