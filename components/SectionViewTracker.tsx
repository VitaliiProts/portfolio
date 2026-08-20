'use client';

import { useEffect } from 'react';
import { trackSectionView, type ViewedSection } from '@/lib/analytics';

/**
 * Обрізаємо нижні 30% вікна: подія йде не тоді, коли край секції ледь визирнув
 * знизу, а коли блок піднявся в зону читання. Відрізаємо саме частку вікна, а
 * не частку секції, бо на телефоні блок буває вищим за екран — тоді поріг на
 * кшталт «видно половину» не спрацював би ніколи.
 */
const readingZone = '0px 0px -30% 0px';

type Props = {
  /** id елемента `<section>`, за яким стежимо. */
  id: string;
  section: ViewedSection;
};

/**
 * Рахує доскрол до секції — один раз за завантаження сторінки.
 *
 * Шукає елемент за id, а не через ref, щоб сама секція лишалася серверним
 * компонентом: у бандл їде цей спостерігач, а не її розмітка.
 */
export function SectionViewTracker({ id, section }: Props) {
  useEffect(() => {
    const element = document.getElementById(id);
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        trackSectionView(section);
      },
      { rootMargin: readingZone },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [id, section]);

  return null;
}
