import { visitorId } from './visitorId';

type AmplitudeSdk = typeof import('@amplitude/unified');

const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

let sdk: Promise<AmplitudeSdk | null> | null = null;

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
            pageViews: true,
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

      const visitor = visitorId();
      if (visitor) amplitude.setUserId(visitor);

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
