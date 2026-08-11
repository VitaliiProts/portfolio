/**
 * Джерело переходу з реклами.
 *
 * @Krav_Kristel — особистий акаунт, а не бот, тому deep link із payload (?start=)
 * недоступний: єдиний спосіб донести джерело в чат — дописати рядок до тексту
 * повідомлення. Мітки беремо з першого переходу і тримаємо в sessionStorage,
 * бо далі людина гуляє сайтом уже без параметрів у URL.
 */

const STORAGE_KEY = 'psykristel:ad-source';
const SUFFIX_PREFIX = '\n\n— джерело: ';

export type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  gclid?: string;
};

let captured = false;

function readStored(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    // Приватний режим або заблоковане сховище — атрибуція просто не працює.
    return null;
  }
}

function capture(): Attribution | null {
  if (typeof window === 'undefined') return null;
  if (captured) return readStored();
  captured = true;

  const params = new URLSearchParams(window.location.search);
  const fresh: Attribution = {
    source: params.get('utm_source') ?? undefined,
    medium: params.get('utm_medium') ?? undefined,
    campaign: params.get('utm_campaign') ?? undefined,
    content: params.get('utm_content') ?? undefined,
    term: params.get('utm_term') ?? undefined,
    // wbraid/gbraid приходять замість gclid, коли користувач не дав згоди на cookie.
    gclid:
      params.get('gclid') ?? params.get('wbraid') ?? params.get('gbraid') ?? undefined,
  };

  if (!Object.values(fresh).some(Boolean)) return readStored();

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    // Не змогли зберегти — мітка діятиме лише в межах поточної сторінки.
  }

  return fresh;
}

/** Рядок для дописування в кінець повідомлення. Порожній для органічного трафіку. */
export function attributionSuffix(): string {
  const data = capture();
  if (!data) return '';

  const parts = [data.source, data.campaign, data.content].filter(Boolean);
  if (parts.length > 0) return SUFFIX_PREFIX + parts.join(' / ');

  return data.gclid ? `${SUFFIX_PREFIX}google ads` : '';
}

/**
 * Дописує джерело до тексту в Telegram-посиланні.
 * Посилання без параметра text (іконки соцмереж) лишаються незмінними.
 */
export function withAttribution(url: string): string {
  const suffix = attributionSuffix();
  if (!suffix) return url;

  // telegramLink() формує рівно один параметр ?text=, тому суфікс дописуємо в
  // кінець рядка. Через URLSearchParams не йдемо навмисно: він серіалізує
  // пробіли як «+», і Telegram показав би текст із плюсами замість пробілів.
  if (!url.includes('?text=') || url.includes('&')) return url;

  return url + encodeURIComponent(suffix);
}
