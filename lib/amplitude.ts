import { adAttribution } from './attribution';
import { visitorId } from './visitorId';

type AmplitudeSdk = typeof import('@amplitude/unified');

const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

let sdk: Promise<AmplitudeSdk | null> | null = null;

/**
 * Автозахоплення атрибуції пише initial_* для всіх 19 рекламних параметрів, які
 * воно знає, і тим, яких немає в URL, ставить рядок EMPTY. Вимкнути це
 * налаштуванням не можна (initialEmptyValue лише перейменовує заглушку), тож
 * зрізаємо такі властивості з $identify перед відправкою: у профілі лишаються
 * тільки параметри з реальними значеннями.
 */
const dropEmptyAttribution: Parameters<AmplitudeSdk['add']>[0] = {
  name: 'drop-empty-attribution',
  type: 'enrichment',
  execute: (event) => {
    const operations = event.user_properties as Record<string, unknown> | undefined;
    const setOnce = operations?.$setOnce;

    if (operations && setOnce && typeof setOnce === 'object') {
      const properties = setOnce as Record<string, unknown>;
      for (const [key, value] of Object.entries(properties)) {
        if (value === 'EMPTY') delete properties[key];
      }

      if (Object.keys(properties).length === 0) delete operations.$setOnce;
    }

    return Promise.resolve(event);
  },
};

/** Тип пристрою рахуємо один раз: у межах вкладки він не змінюється. */
let device: 'mobile' | 'desktop' | undefined;

function deviceType(): 'mobile' | 'desktop' {
  const agent = navigator.userAgent;
  device ??=
    /Mobi|Android|iPhone|iPad|iPod/i.test(agent) ||
    // iPadOS від 13-ї версії представляється як Macintosh, і відрізнити його
    // можна лише за наявністю тач-екрана.
    (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)
      ? 'mobile'
      : 'desktop';

  return device;
}

/**
 * Планшети рахуємо за мобільні: розбивка потрібна для оцінки реклами, а там
 * важливо саме те, чи людина прийшла з телефона.
 */
const addDevice: Parameters<AmplitudeSdk['add']>[0] = {
  name: 'device-property',
  type: 'enrichment',
  execute: (event) => {
    // Службові події ($identify і подібні) властивостей не несуть.
    if (!event.event_type.startsWith('$')) {
      event.event_properties = { ...event.event_properties, device: deviceType() };
    }

    return Promise.resolve(event);
  },
};

/**
 * Пошуковий запит, за яким прийшли з Google Ads. Автозахоплення атрибуції пише
 * utm_term лише у властивості події, тому для сегментації користувачів кладемо
 * його ще й у профіль: keyword — останній перехід, initial_keyword — перший.
 */
function setKeyword(amplitude: AmplitudeSdk): void {
  const keyword = adAttribution()?.keyword;
  if (!keyword) return;

  const identify = new amplitude.Identify();
  identify.set('keyword', keyword);
  identify.setOnce('initial_keyword', keyword);
  amplitude.identify(identify);
}

/**
 * Динамічний import, а не звичайний: інакше SDK разом із рекордером session
 * replay (~600 КБ) потрапляє в бандл, який тягне кожна кнопка з трекінгом, і
 * виконується під час гідратації. Тут він стає окремим чанком і завантажується
 * лише коли аналітика справді потрібна.
 */
function init(): Promise<AmplitudeSdk | null> {
  if (!apiKey) {
    console.warn('Amplitude API key missing — analytics disabled');
    return Promise.resolve(null);
  }

  return import('@amplitude/unified')
    .then((amplitude) => {
      amplitude.initAll(apiKey, {
        serverZone: 'EU',
        analytics: {
          autocapture: {
            elementInteractions: false,
            attribution: true,
            fileDownloads: true,
            formInteractions: true,
            // Своя назва замість «[Amplitude] Page Viewed»: у стрічці подій SDK
            // показує її як «Viewed "<title>" Page», а заголовок сторінки тут
            // довгий і в звітах нечитабельний.
            pageViews: { eventType: 'landing_page_view' },
            sessions: true,
            frustrationInteractions: true,
            networkTracking: true,
            webVitals: false,
          },
        },
        sessionReplay: { sampleRate: 1 },
        // initAll піднімає ще й Guides & Surveys: окремий скрипт із CDN і подія
        // про власне завантаження. На лендінгу без опитувань і підказок це лише
        // зайвий запит і шум у звітах.
        engagement: { skip: true },
      });

      // Синхронно після initAll: SDK ще ініціалізується, тому плагін стає в ту
      // саму чергу й реєструється до першої події атрибуції.
      amplitude.add(dropEmptyAttribution);
      amplitude.add(addDevice);

      const visitor = visitorId();
      if (visitor) amplitude.setUserId(visitor);

      setKeyword(amplitude);

      return amplitude;
    })
    .catch((error: unknown) => {
      // Блокувальник рекламних скриптів або обрив мережі не мають ламати сайт.
      console.warn('Amplitude failed to load', error);
      return null;
    });
}

/** Піднімає SDK, якщо він ще не піднятий. Повторні виклики безпечні. */
export function startAmplitude(): Promise<AmplitudeSdk | null> {
  sdk ??= init();
  return sdk;
}

/**
 * Події, які трапилися до готовності SDK, чекають у черзі промісу й ідуть
 * одразу після ініціалізації — у тому ж порядку, у якому їх викликали.
 */
export function trackAmplitude(event: string, properties?: Record<string, unknown>): void {
  void startAmplitude().then((amplitude) => amplitude?.track(event, properties));
}
