'use client';

import { useEffect } from 'react';
import { onEngagement } from '@/lib/engagement';

/**
 * Вантажить gtag.js після першої взаємодії.
 *
 * Безпечно для конверсій: інлайн-бутстрап уже створив window.gtag, який складає
 * виклики в dataLayer, а бібліотека розбирає чергу, щойно завантажиться. Тому
 * навіть клік по кнопці раніше за завантаження скрипта не втрачається.
 */
export function GoogleTagLoader({ src }: { src: string }) {
  useEffect(
    () =>
      onEngagement(() => {
        if (document.querySelector(`script[src="${src}"]`)) return;

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      }),
    [src],
  );

  return null;
}
