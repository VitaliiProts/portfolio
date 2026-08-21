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
  keyword?: string;
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
  // ValueTrack підставляє порожній рядок, коли макрос не має значення (DSA,
  // performance max), тому порожнє прирівнюємо до відсутнього.
  const param = (name: string) => params.get(name)?.trim() || undefined;

  const term = param('utm_term');
  const fresh: Attribution = {
    source: param('utm_source'),
    medium: param('utm_medium'),
    campaign: param('utm_campaign'),
    content: param('utm_content'),
    term,
    // {keyword} зазвичай кладуть у utm_term, але в частині кампаній його
    // передають окремим параметром — беремо перший непорожній.
    keyword: term ?? param('keyword') ?? param('kw'),
    // wbraid/gbraid приходять замість gclid, коли користувач не дав згоди на cookie.
    gclid: param('gclid') ?? param('wbraid') ?? param('gbraid'),
  };

  if (!Object.values(fresh).some(Boolean)) return readStored();

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    // Не змогли зберегти — мітка діятиме лише в межах поточної сторінки.
  }

  return fresh;
}

/** Мітки першого переходу в сесії. null для органічного трафіку. */
export function adAttribution(): Attribution | null {
  return capture();
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
