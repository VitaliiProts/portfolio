import Link from 'next/link';
import { articlePath, articlesForTopic } from '@/lib/articles';
import styles from './TopicPage.module.css';

/**
 * Зворотний бік перелінковки зі статей. Список будується з поля topics самої
 * статті, тому на сторінці теми нема що підтримувати руками: додали статтю —
 * посилання зʼявилося, зняли з публікації — зникло.
 */
export function TopicArticles({ slug }: { slug: string }) {
  const articles = articlesForTopic(slug);

  if (articles.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby="topic-articles-title">
      <h2 id="topic-articles-title">Статті по темі</h2>

      <ul>
        {articles.map((article) => (
          <li key={article.slug}>
            <Link href={articlePath(article.slug)}>{article.h1}</Link>
            <p>{article.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
