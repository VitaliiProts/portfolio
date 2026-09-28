import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { INLINE_LINK_PATTERN } from '@/lib/articles';

/**
 * Єдина інлайнова конструкція в текстах статей — [анкор](/шлях). Розбираємо її
 * тут, а не зберігаємо посилання окремим полем: анкор має стояти в реченні, де
 * він щось означає, інакше перелінковка перетворюється на список «детальніше».
 *
 * Регулярний вираз із прапорцем g зберігає lastIndex між викликами, тож
 * створюємо власну копію на кожен рендер — спільний екземпляр пропускав би
 * посилання через раз.
 */
export function RichText({ text }: { text: string }): ReactNode {
  const pattern = new RegExp(INLINE_LINK_PATTERN.source, 'g');
  const matches = [...text.matchAll(pattern)];

  if (matches.length === 0) return text;

  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of matches) {
    const [whole, anchor, href] = match;
    // Групи гарантовані виразом, але не типом: без перевірки noUncheckedIndexedAccess
    // не дає покласти їх у href.
    if (anchor === undefined || href === undefined) continue;

    const start = match.index ?? 0;
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <Link key={`${href}-${start}`} href={href}>
        {anchor}
      </Link>,
    );
    cursor = start + whole.length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));

  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>);
}
