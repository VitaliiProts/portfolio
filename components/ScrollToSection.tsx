'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Секції головної, доступні за чистими шляхами (`/about`, `/contact` тощо).
 * Rewrites у next.config.ts віддають головну за цими шляхами, а цей компонент
 * прокручує до потрібної секції при першому завантаженні.
 */
const sectionIds = new Set([
  'about',
  'certs',
  'services',
  'topics',
  'faq',
  'reviews',
  'pricing',
  'contact',
  'privacy',
  'free-consult',
]);

export function ScrollToSection() {
  const pathname = usePathname();

  useEffect(() => {
    const id = pathname.replace(/^\//, '');
    if (!sectionIds.has(id)) return;

    // Невелика затримка, щоб DOM встиг відрендеритися після гідратації.
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [pathname]);

  return null;
}
