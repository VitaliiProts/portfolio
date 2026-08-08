/**
 * Єдине джерело правди для контактів, цін і зовнішніх посилань.
 * Змінюємо тут — оновлюється по всьому сайту, включно з JSON-LD і sitemap.
 */

/**
 * Пріоритет: власний домен → адреса продакшн-деплою Vercel → запасне значення.
 * Завдяки другому кроку канонічні URL і Open Graph коректні ще до того,
 * як до проєкту прикрутили власний домен.
 */
const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelUrl ? `https://${vercelUrl}` : '') ||
  'https://psykristel.com'
).replace(/\/$/, '');

export const site = {
  url: siteUrl,
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
