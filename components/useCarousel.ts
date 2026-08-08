'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type CarouselApi<T extends HTMLElement> = {
  railRef: React.RefObject<T | null>;
  scrollPrev: () => void;
  scrollNext: () => void;
  atStart: boolean;
  atEnd: boolean;
};

/**
 * Горизонтальна прокрутка з кроком в одну картку.
 *
 * Прокрутка йде до точної позиції конкретної картки (`scrollTo`), а не відносним
 * `scrollBy`: у Safari/iOS відносна плавна прокрутка всередині snap-контейнера
 * часто ігнорується або одразу відкочується назад.
 */
export function useCarousel<T extends HTMLElement = HTMLDivElement>(
  itemSelector: string,
): CarouselApi<T> {
  const railRef = useRef<T>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setAtStart(rail.scrollLeft <= 1);
    setAtEnd(max <= 1 || rail.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    syncEdges();
    rail.addEventListener('scroll', syncEdges, { passive: true });

    const observer = new ResizeObserver(syncEdges);
    observer.observe(rail);

    return () => {
      rail.removeEventListener('scroll', syncEdges);
      observer.disconnect();
    };
  }, [syncEdges]);

  const goTo = useCallback(
    (direction: 1 | -1) => {
      const rail = railRef.current;
      if (!rail) return;

      const items = Array.from(rail.querySelectorAll<HTMLElement>(itemSelector));
      if (items.length === 0) return;

      // Позиції карток у системі координат прокрутки рейки.
      const railLeft = rail.getBoundingClientRect().left - rail.scrollLeft;
      const offsets = items.map((item) => Math.round(item.getBoundingClientRect().left - railLeft));

      const current = rail.scrollLeft;
      const max = rail.scrollWidth - rail.clientWidth;
      const target =
        direction === 1
          ? (offsets.find((offset) => offset > current + 1) ?? max)
          : ([...offsets].reverse().find((offset) => offset < current - 1) ?? 0);

      const left = Math.max(0, Math.min(target, max));

      rail.scrollTo({ left, behavior: 'smooth' });
      // Safari може не згенерувати подію scroll одразу — оновлюємо стан стрілок вручну.
      window.setTimeout(syncEdges, 500);
    },
    [itemSelector, syncEdges],
  );

  return {
    railRef,
    scrollPrev: () => goTo(-1),
    scrollNext: () => goTo(1),
    atStart,
    atEnd,
  };
}
