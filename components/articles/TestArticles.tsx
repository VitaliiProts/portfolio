import Link from 'next/link';
import { articlePath, articlesForTest } from '@/lib/articles';
import shared from '@/components/topics/TopicPage.module.css';

/**
 * Статті, які згадують цю методику. Список будується з поля tests самої
 * статті, тож сторінка тесту нічого не тримає руками — той самий патерн, що і
 * в TopicArticles.
 */
export function TestArticles({ slug }: { slug: string }) {
  const articles = articlesForTest(slug);

  if (articles.length === 0) return null;

  return (
    <section className={shared.related} aria-labelledby="test-articles-title">
      <h2 id="test-articles-title">Читати по темі</h2>

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
