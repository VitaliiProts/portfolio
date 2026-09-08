import type { TopicDefinition } from './types';

/** Порядок визначає видачу в футері, sitemap і llms.txt. */
export const topics: readonly TopicDefinition[] = [];

/**
 * У проді показуємо лише опубліковані теми. Локально й на превʼю-деплоях —
 * усі: превʼю віддає X-Robots-Tag: noindex (див. next.config.ts), тож чернетка
 * не потрапить в індекс, а прапорець не доводиться перемикати заради показу.
 */
export function visibleTopics(): readonly TopicDefinition[] {
  const isProduction = (process.env.VERCEL_ENV ?? 'production') === 'production';
  return isProduction ? topics.filter((topic) => topic.published) : topics;
}

export function getTopic(slug: string): TopicDefinition | undefined {
  return visibleTopics().find((topic) => topic.slug === slug);
}

export function topicPath(slug: string): string {
  return `/${slug}`;
}

/** Дочірні теми хаба, у порядку реєстру. */
export function childrenOf(slug: string): readonly TopicDefinition[] {
  return visibleTopics().filter((topic) => topic.parent === slug);
}

/** Сестринські теми: спільний батько, крім самої сторінки. */
export function siblingsOf(topic: TopicDefinition): readonly TopicDefinition[] {
  if (!topic.parent) return [];
  return childrenOf(topic.parent).filter((item) => item.slug !== topic.slug);
}

export type { TopicBlock, TopicDefinition, TopicSection } from './types';
export { REQUIRED_SECTION_IDS } from './types';
