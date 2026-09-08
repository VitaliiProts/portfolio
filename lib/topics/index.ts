import { anorexia } from './anorexia';
import { anxietyAndPanicAttacks } from './anxiety-and-panic-attacks';
import { bingeEating } from './binge-eating';
import { bulimia } from './bulimia';
import { eatingDisorders } from './eating-disorders';
import { teens } from './teens';
import type { TopicDefinition } from './types';

/** Порядок визначає видачу в футері, sitemap і llms.txt. */
export const topics: readonly TopicDefinition[] = [
  eatingDisorders,
  anorexia,
  bulimia,
  bingeEating,
  anxietyAndPanicAttacks,
  teens,
];

/**
 * Чернетки ховаємо лише на проді. Порівнюємо з 'production' напряму, без
 * підстановки за замовчуванням: коли VERCEL_ENV не заданий — тобто локально —
 * теми мають бути видні, інакше сторінку неможливо відкрити до публікації.
 * На превʼю-деплоях чернетки теж видно, але весь превʼю віддає
 * X-Robots-Tag: noindex (див. next.config.ts), тож в індекс вони не потраплять.
 */
export function visibleTopics(): readonly TopicDefinition[] {
  const isProduction = process.env.VERCEL_ENV === 'production';
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
