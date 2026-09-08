import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

export type Crumb = { name: string; path: string };

/** «Головна» додається автоматично; trail — лише подальші рівні. */
export function Breadcrumbs({ trail }: { trail: readonly Crumb[] }) {
  const items: readonly Crumb[] = [{ name: 'Головна', path: '/' }, ...trail];

  return (
    <nav className={styles.crumbs} aria-label="Навігація сторінками">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.path} className={styles.crumb}>
            {isLast ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <>
                <Link href={item.path}>{item.name}</Link>
                <span aria-hidden="true"> · </span>
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
}
