'use client';

import { useEffect } from 'react';
import { googleAdsId, googleAdsConversionLabel } from '@/lib/analytics';

/**
 * Делегований слухач кліків по Telegram-посиланнях.
 *
 * Ловить кліки по будь-якому `a[href*="t.me"]` на сторінці й відправляє
 * конверсію в Google Ads. Працює як запасний механізм: посилання, які вже
 * обробив <TelegramLink> (з атрибутом data-tracked), пропускаються, щоб не
 * було подвійного рахування.
 *
 * Монтується один раз у layout — покриває всю сторінку, включно з динамічно
 * створеними посиланнями.
 */
export function TelegramClickTracker() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const link = (e.target as Element)?.closest?.('a[href*="t.me"]');
      if (!link) return;

      // TelegramLink вже відстежив цей клік — пропускаємо.
      if (link.hasAttribute('data-tracked')) return;

      // Відправляємо лише конверсію; детальна аналітика неможлива без source.
      if (!window.gtag || !googleAdsId || !googleAdsConversionLabel) return;

      window.gtag('event', 'conversion', {
        send_to: `${googleAdsId}/${googleAdsConversionLabel}`,
        value: 320,
        currency: 'UAH',
      });
    }

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, []);

  return null;
}