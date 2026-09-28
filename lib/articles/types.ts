import type { Accordion } from '../content';

/**
 * Блоки навмисно збігаються з TopicBlock: та сама палітра виражальних засобів,
 * той самий вигляд на сторінці. Різниця між статтею й темою — не в блоках, а в
 * обгортці: у статті є автор, дата й розмітка Article, у теми — скелет послуги,
 * теги відгуків і блок цін.
 *
 * У тексті параграфів і пунктів списку допускається розмітка посилання
 * [анкор](/шлях). Інших інлайнових конструкцій немає: жирний, курсив і
 * зовнішні адреси в тілі статті не потрібні, а кожна нова — це ще одна гілка
 * в рендері й ще один спосіб зламати текст непомітно.
 */
export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: readonly string[] }
  | { type: 'callout'; tone: 'info' | 'safety'; text: string };

export type ArticleSection = {
  /** Якір і ключ порядку. Латиницею, бо потрапляє в URL. */
  id: string;
  /** H2. Здебільшого питання — у тому формулюванні, як його ставлять у пошук. */
  heading: string;
  blocks: readonly ArticleBlock[];
};

export type ArticleDefinition = {
  slug: string;
  /** <title>, ≤ 60 знаків. */
  title: string;
  /** meta description, 140–155 знаків. */
  description: string;
  /** <h1>, не дорівнює title дослівно. */
  h1: string;
  /**
   * Абзац-відповідь під H1. Найважливіші речення статті: саме їх витягує
   * мовна модель у цитату, тож вони мають бути зрозумілі без решти тексту.
   */
  lead: string;
  /** Одне речення для хаба статей і llms.txt. */
  summary: string;
  published: boolean;
  /** ISO-дата першої публікації. Проставляється руками. */
  publishedAt: string;
  /** ISO-дата останньої змістовної правки. */
  updatedAt: string;
  sections: readonly ArticleSection[];
  faq: readonly Accordion[];
  /** Slug-и тем із lib/topics, на які стаття веде читача. */
  topics: readonly string[];
  /** Slug-и інших статей кластера. */
  related: readonly string[];
  /** Slug-и з lib/tests. */
  tests: readonly string[];
  /** Текст повідомлення для telegramLink(). */
  ctaMessage: string;
};

/**
 * Остання секція кожної статті. Стаття відповідає на питання читача, але
 * закінчується тим самим, чим закінчується пошук, який його сюди привів, —
 * поясненням, як влаштована робота й що робити далі.
 */
export const REQUIRED_LAST_SECTION_ID = 'work-with-me';

/** Розмітка інлайнового посилання в тексті блоку: [анкор](/шлях). */
export const INLINE_LINK_PATTERN = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
