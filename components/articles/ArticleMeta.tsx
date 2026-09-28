import Link from 'next/link';
import { formatArticleDate } from '@/lib/articles/format';
import { site } from '@/lib/site';
import styles from './ArticlePage.module.css';

/**
 * Видимі автор і дата. Для читача це ознака, що текст написала конкретна
 * фахівчиня, для моделі — єдине місце, де ім'я автора стоїть поруч із датою
 * оновлення в машинно-читабельному вигляді.
 */
export function ArticleMeta({ updatedAt }: { updatedAt: string }) {
  return (
    <p className={styles.meta}>
      <Link href="/about">{site.shortName}</Link>, психолог і гештальт-терапевт у процесі
      сертифікації <span aria-hidden="true">·</span> оновлено{' '}
      <time dateTime={updatedAt}>{formatArticleDate(updatedAt)}</time>
    </p>
  );
}
