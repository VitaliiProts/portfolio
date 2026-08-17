'use client';

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { trackTelegramClick, type TelegramCtaSource } from '@/lib/analytics';
import { withAttribution } from '@/lib/attribution';

type Props = Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'onClick' | 'target' | 'rel'> & {
  href: string;
  source: TelegramCtaSource;
  /** Slug тесту — лише для кнопки на екрані результату тесту. */
  testSlug?: string;
};

/**
 * Єдина точка входу для всіх переходів у Telegram: рахує конверсію і додає
 * джерело переходу до тексту повідомлення.
 *
 * Мітку джерела дописуємо в DOM після монтування, а не через стан: розмітка на
 * сервері й клієнті збігається, зайвого рендера немає, а посилання лишається
 * робочим навіть без JS.
 */
export function TelegramLink({ href, source, testSlug, children, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const link = ref.current;
    if (!link) return;

    const resolved = withAttribution(href);
    if (resolved !== href) link.href = resolved;
  }, [href]);

  return (
    <a
      {...rest}
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackTelegramClick(source, { test: testSlug })}
    >
      {children}
    </a>
  );
}
