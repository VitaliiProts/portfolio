import type { Accordion, ReviewTag } from '../content';

export type TopicBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: readonly string[] }
  | { type: 'callout'; tone: 'info' | 'safety'; text: string };

export type TopicSection = {
  /** Якір і ключ порядку. Латиницею, бо потрапляє в URL. */
  id: string;
  heading: string;
  blocks: readonly TopicBlock[];
};

export type TopicDefinition = {
  slug: string;
  /** <title>, ≤ 60 знаків. */
  title: string;
  /** meta description, ≤ 155 знаків. */
  description: string;
  /** <h1>, не дорівнює title дослівно. */
  h1: string;
  /** Абзац під H1 — пряма відповідь на пошуковий запит. */
  lead: string;
  published: boolean;
  /** ISO-дата останньої змістовної правки. Проставляється руками. */
  updatedAt: string;
  /** Slug хаба для дочірніх сторінок РХП. */
  parent?: string;
  /**
   * Сторінка з цим прапорцем мусить містити callout із tone: 'safety'.
   * Його рамкова формула — зачин «З деякими станами не можна чекати до сесії
   * з психологом» і фінал «Психотерапію ми зможемо почати або продовжити,
   * коли тілу буде безпечно» — канонічна: вона навмисно збігається дослівно
   * між сторінками й хабом, бо текст, який маршрутизує людину до невідкладної
   * допомоги, — не місце для стилістичної варіативності. Не «виправляйте» цей
   * повтор. Червоні прапорці всередині callout — свої для кожного стану.
   */
  requiresSafetyNote: boolean;
  sections: readonly TopicSection[];
  faq: readonly Accordion[];
  reviewTags: readonly ReviewTag[];
  /** Slug-и з lib/tests. */
  tests: readonly string[];
  /** Текст повідомлення для telegramLink(). */
  ctaMessage: string;
};

/** Обов'язковий кістяк сторінки в порядку показу. */
export const REQUIRED_SECTION_IDS = [
  'symptoms',
  'when-to-seek-help',
  'therapy',
  'format',
  'today',
] as const;
