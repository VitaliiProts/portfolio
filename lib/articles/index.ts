import { anxietyWhenToGetHelp } from './anxiety-when-to-get-help';
import { anxiousAttachment } from './anxious-attachment';
import { attachmentStyles } from './attachment-styles';
import { bingeEatingVsOvereating } from './binge-eating-vs-overeating';
import { eatingDisorderLovedOne } from './eating-disorder-loved-one';
import { eatingDisordersTypesSigns } from './eating-disorders-types-signs';
import { gestaltTherapy } from './gestalt-therapy';
import type { ArticleDefinition } from './types';

/** Порядок визначає видачу на хабі, у sitemap і llms.txt. */
export const articles: readonly ArticleDefinition[] = [
  gestaltTherapy,
  bingeEatingVsOvereating,
  anxietyWhenToGetHelp,
  eatingDisordersTypesSigns,
  anxiousAttachment,
  attachmentStyles,
  eatingDisorderLovedOne,
];

export const articlesHubPath = '/articles';

export function articlePath(slug: string): string {
  return `${articlesHubPath}/${slug}`;
}

/**
 * Та сама логіка, що й для тем: чернетки ховаємо лише на проді, бо локально й
 * на превʼю статтю треба відкривати до публікації. Превʼю цілком віддає
 * X-Robots-Tag: noindex, тож в індекс чернетка не потрапить.
 */
export function visibleArticles(): readonly ArticleDefinition[] {
  const isProduction = process.env.VERCEL_ENV === 'production';
  return isProduction ? articles.filter((article) => article.published) : articles;
}

export function getArticle(slug: string): ArticleDefinition | undefined {
  return visibleArticles().find((article) => article.slug === slug);
}

/** Статті кластера, оголошені в related, у порядку реєстру й без невидимих. */
export function relatedArticles(article: ArticleDefinition): readonly ArticleDefinition[] {
  return visibleArticles().filter(
    (item) => item.slug !== article.slug && article.related.includes(item.slug),
  );
}

/**
 * Зворотний бік перелінковки: стаття називає теми, а сторінка теми питає, які
 * статті на неї посилаються. Так звʼязок лишається в одному місці — у самій
 * статті, — і не доводиться тримати синхронними два списки.
 */
export function articlesForTopic(slug: string): readonly ArticleDefinition[] {
  return visibleArticles().filter((article) => article.topics.includes(slug));
}

/**
 * Те саме для тестів: стаття оголошує, які методики згадує, а сторінка тесту
 * питає, кому вона потрібна. Без цього підкластер привʼязаності лишався б без
 * входу — теми «стосунки» на сайті ще немає, а /tests/attachment уже є.
 */
export function articlesForTest(slug: string): readonly ArticleDefinition[] {
  return visibleArticles().filter((article) => article.tests.includes(slug));
}

export type { ArticleBlock, ArticleDefinition, ArticleSection } from './types';
export { INLINE_LINK_PATTERN, REQUIRED_LAST_SECTION_ID } from './types';
