import Link from 'next/link';
import {
  articlePath,
  type ArticleDefinition,
  relatedArticles,
} from '@/lib/articles';
import { getTopic, topicPath } from '@/lib/topics';
import shared from '@/components/topics/TopicPage.module.css';

/**
 * Дві групи посилань в одному блоці: сторінки тем, куди стаття веде читача
 * далі, і сусідні статті кластера. Невидимі цілі відсіюють visibleTopics() і
 * visibleArticles(), тож чернетка не дає посилання в нікуди.
 */
export function ArticleRelated({ article }: { article: ArticleDefinition }) {
  const topics = article.topics
    .map((slug) => getTopic(slug))
    .filter((topic) => topic !== undefined);
  const articles = relatedArticles(article);

  if (topics.length === 0 && articles.length === 0) return null;

  return (
    <section className={shared.related} aria-labelledby="article-related-title">
      <h2 id="article-related-title">Читати далі</h2>

      <ul>
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link href={topicPath(topic.slug)}>{topic.h1}</Link>
            <p>{topic.description}</p>
          </li>
        ))}
        {articles.map((item) => (
          <li key={item.slug}>
            <Link href={articlePath(item.slug)}>{item.h1}</Link>
            <p>{item.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
