import Link from 'next/link';
import { childrenOf, getTopic, siblingsOf, type TopicDefinition, topicPath } from '@/lib/topics';
import styles from './TopicPage.module.css';

/**
 * Хаб веде на дітей, дитина — на хаб і сестер. Анкор дорівнює h1 цільової
 * сторінки: описове посилання і для читача, і для пошуку.
 */
export function TopicRelated({ topic }: { topic: TopicDefinition }) {
  const parent = topic.parent ? getTopic(topic.parent) : undefined;
  const related = parent ? [parent, ...siblingsOf(topic)] : childrenOf(topic.slug);

  if (related.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby="related-title">
      <h2 id="related-title">Суміжні теми</h2>

      <ul>
        {related.map((item) => (
          <li key={item.slug}>
            <Link href={topicPath(item.slug)}>{item.h1}</Link>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
