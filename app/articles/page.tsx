import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { articlePath, visibleArticles } from '@/lib/articles';
import { formatArticleDate } from '@/lib/articles/format';
import { buildArticlesHubJsonLd } from '@/lib/jsonLd';
import styles from '@/components/articles/ArticlePage.module.css';
import shared from '@/components/topics/TopicPage.module.css';

/**
 * Поки жодна стаття не опублікована, хаб — порожня сторінка. Індексувати її
 * немає сенсу, тому в цьому випадку закриваємо її від пошуку; у sitemap вона
 * теж не потрапляє (див. app/sitemap.ts).
 */
export function generateMetadata(): Metadata {
  // Ключ robots додаємо лише тоді, коли треба закрити сторінку. Передати
  // undefined не те саме, що не передати: Next бере значення з generateMetadata
  // як остаточне й затирає ним noindex, який layout ставить на прев'ю-деплоях.
  if (visibleArticles().length > 0) return metadata;

  return { ...metadata, robots: { index: false, follow: true } };
}

const metadata: Metadata = {
  title: 'Статті психолога — РХП, тривожність, привʼязаність',
  description:
    'Статті про розлади харчової поведінки, тривожність, типи привʼязаності та гештальт-терапію: як розпізнати стан і коли звертатися по допомогу.',
  alternates: { canonical: '/articles' },
  openGraph: {
    type: 'website',
    url: '/articles',
    title: 'Статті психолога Крістель Кравець',
    description:
      'Про розлади харчової поведінки, тривожність, привʼязаність і гештальт-терапію — спокійно й без залякування.',
  },
};

export default function ArticlesPage() {
  const articles = visibleArticles();

  return (
    <>
      <JsonLd data={buildArticlesHubJsonLd()} />

      <section className={shared.page} aria-labelledby="articles-title">
        <div className={`wrap ${shared.inner}`}>
          <Breadcrumbs trail={[{ name: 'Статті', path: '/articles' }]} />

          <h1 id="articles-title" className={shared.title}>
            Статті про РХП, тривожність і привʼязаність<span className="dot">.</span>
          </h1>
          <p className={`lead ${shared.lead}`}>
            Відповіді на питання, які виникають ще до того, як людина починає шукати психолога:
            що з нею відбувається, чи це нормально й коли варто звертатися по допомогу. Пише
            Крістель Кравець — психолог і гештальт-терапевт у процесі сертифікації, фахівець з
            розладів харчової поведінки.
          </p>

          {articles.length > 0 ? (
            <ul className={styles.cards}>
              {articles.map((article) => (
                <li key={article.slug}>
                  <h2>
                    <Link href={articlePath(article.slug)}>{article.h1}</Link>
                  </h2>
                  <p>{article.summary}</p>
                  <time dateTime={article.updatedAt}>
                    Оновлено {formatArticleDate(article.updatedAt)}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p>Статті готуються до публікації.</p>
          )}
        </div>
      </section>
    </>
  );
}
