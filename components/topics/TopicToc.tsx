import type { TopicSection } from '@/lib/topics';
import styles from './TopicPage.module.css';

/** Список підтем із якорями: орієнтир для читача і перелік розділів для краулера. */
export function TopicToc({ sections }: { sections: readonly TopicSection[] }) {
  return (
    <nav className={styles.toc} aria-label="Зміст сторінки">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.heading}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
