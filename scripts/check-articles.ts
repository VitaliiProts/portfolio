/**
 * Інваріанти реєстру статей. Побудовано за зразком check-topics.ts: частина
 * перевірок працює лише для published: true, інакше чернетка блокувала б
 * збірку ще до того, як текст дописано.
 *
 * Запуск: npm run check:articles, з --drafts — ті самі перевірки й для чернеток.
 *
 * Найважливіша тут — перевірка інлайнових посилань. Стаття посилається рядком
 * [анкор](/шлях), тобто без участі типів, і без цієї перевірки опублікований
 * текст міг би вести на чернетку або на неіснуючий маршрут, а помітили б це
 * вже читачі.
 */
import {
  articlePath,
  articles,
  articlesHubPath,
  type ArticleDefinition,
  INLINE_LINK_PATTERN,
  REQUIRED_LAST_SECTION_ID,
} from '../lib/articles';
import { faq as siteFaq } from '../lib/content';
import { sectionIds } from '../lib/site';
import { testPath, testSlugs, testsHubPath } from '../lib/tests';
import { topics } from '../lib/topics';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const RESERVED_SLUGS: readonly string[] = [...sectionIds, 'tests', 'articles'];

/** Обсяг з чекліста: 1 200–2 000 слів, із невеликим запасом угору. */
const MIN_WORDS = 1200;
const MAX_WORDS = 2100;

/** Незакритий маркер із тексту статті. Рендериться як звичайний текст, тож на
 *  опублікованій сторінці його побачить читач. */
const TODO_MARKER = /\[ПОТРІБНО ПІДТВЕРДИТИ[^\]]*\]/g;

let failures = 0;

function expect(condition: boolean, message: string): void {
  if (condition) return;
  failures += 1;
  console.log(`FAIL ${message}`);
}

/** Не помилка, але те, що автор має побачити перед публікацією. */
function warn(message: string): void {
  console.log(`WARN ${message}`);
}

/** Той самий нормалізатор, що і в check-topics.ts: U+02BC не ловиться \p{L}. */
function normalize(question: string): string {
  return question
    .toLowerCase()
    .replace(/ʼ/gu, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function blockTexts(article: ArticleDefinition): readonly string[] {
  const texts = [article.lead];

  for (const section of article.sections) {
    for (const block of section.blocks) {
      if (block.type === 'list') texts.push(...block.items);
      else texts.push(block.text);
    }
  }

  return texts;
}

function wordCount(article: ArticleDefinition): number {
  // Розмітку посилання зводимо до анкора: інакше шлях додавав би фальшиві слова.
  const plain = blockTexts(article)
    .join(' ')
    .replace(new RegExp(INLINE_LINK_PATTERN.source, 'g'), '$1');

  return plain.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

function inlineLinks(article: ArticleDefinition): readonly string[] {
  const pattern = new RegExp(INLINE_LINK_PATTERN.source, 'g');

  return blockTexts(article).flatMap((text) =>
    [...text.matchAll(pattern)]
      .map((match) => match[2])
      .filter((href) => href !== undefined),
  );
}

/** Усі шляхи, на які стаття має право послатися, і чи вони вже опубліковані. */
const knownPaths = new Map<string, boolean>([
  ['/', true],
  [testsHubPath, true],
  [articlesHubPath, true],
  ...sectionIds.map((id) => [`/${id}`, true] as const),
  ...testSlugs.map((slug) => [testPath(slug), true] as const),
  ...topics.map((topic) => [`/${topic.slug}`, topic.published] as const),
  ...articles.map((article) => [articlePath(article.slug), article.published] as const),
]);

console.log('--- структура ---');

const seenSlugs = new Set<string>();
const articleSlugs = articles.map((article) => article.slug);

for (const article of articles) {
  const at = article.slug;

  expect(!seenSlugs.has(article.slug), `${at}: slug дублюється`);
  seenSlugs.add(article.slug);

  expect(SLUG_PATTERN.test(article.slug), `${at}: slug має бути латиницею через дефіс`);
  expect(!RESERVED_SLUGS.includes(article.slug), `${at}: slug зайнятий іншим маршрутом`);

  for (const [label, value] of [
    ['publishedAt', article.publishedAt],
    ['updatedAt', article.updatedAt],
  ] as const) {
    expect(
      /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)),
      `${at}: ${label} має бути коректною ISO-датою`,
    );
  }

  expect(
    article.updatedAt >= article.publishedAt,
    `${at}: updatedAt раніше за publishedAt`,
  );

  const ids = article.sections.map((section) => section.id);
  expect(new Set(ids).size === ids.length, `${at}: id секцій дублюються`);
  expect(
    ids.at(-1) === REQUIRED_LAST_SECTION_ID,
    `${at}: остання секція має бути «${REQUIRED_LAST_SECTION_ID}» (маємо «${ids.at(-1) ?? '—'}»)`,
  );

  for (const section of article.sections) {
    expect(section.blocks.length > 0, `${at}/${section.id}: порожня секція`);
    expect(SLUG_PATTERN.test(section.id), `${at}/${section.id}: id секції має бути латиницею`);
  }

  for (const slug of article.topics) {
    expect(
      topics.some((topic) => topic.slug === slug),
      `${at}: тема «${slug}» не існує`,
    );
  }

  for (const slug of article.related) {
    expect(slug !== article.slug, `${at}: стаття посилається сама на себе в related`);
    expect(articleSlugs.includes(slug), `${at}: стаття «${slug}» не існує`);
  }

  for (const slug of article.tests) {
    expect(testSlugs.includes(slug), `${at}: тест «${slug}» не існує`);
  }

  for (const href of inlineLinks(article)) {
    expect(knownPaths.has(href), `${at}: посилання «${href}» веде на невідомий шлях`);
  }
}

const includeDrafts = process.argv.includes('--drafts');

console.log(
  includeDrafts
    ? '--- усі статті, разом із чернетками ---'
    : '--- опубліковані статті ---',
);

/**
 * Питання не мають повторюватися між головною, темами й статтями: дублі в
 * розмітці FAQPage конкурують одне з одним за той самий фрагмент у видачі.
 */
const seenQuestions = new Map<string, string>();

for (const item of siteFaq) {
  seenQuestions.set(normalize(item.question), 'головна');
}

for (const topic of topics.filter((item) => item.published)) {
  for (const item of topic.faq) {
    seenQuestions.set(normalize(item.question), topic.slug);
  }
}

for (const article of articles.filter((item) => includeDrafts || item.published)) {
  const at = article.slug;
  const words = wordCount(article);

  expect(words >= MIN_WORDS, `${at}: ${words} слів, потрібно ≥ ${MIN_WORDS}`);
  expect(words <= MAX_WORDS, `${at}: ${words} слів, максимум ${MAX_WORDS}`);

  expect(article.title.length <= 60, `${at}: title ${article.title.length} знаків, максимум 60`);
  expect(
    article.description.length >= 140 && article.description.length <= 155,
    `${at}: description ${article.description.length} знаків, потрібно 140–155`,
  );
  expect(article.h1 !== article.title, `${at}: h1 дослівно дорівнює title`);

  expect(
    article.faq.length >= 3 && article.faq.length <= 5,
    `${at}: ${article.faq.length} FAQ, потрібно 3–5`,
  );

  for (const item of article.faq) {
    const key = normalize(item.question);
    const owner = seenQuestions.get(key);
    expect(owner === undefined, `${at}: питання «${item.question}» вже є (${owner})`);
    seenQuestions.set(key, at);
  }

  // Опублікована стаття не має вести на чернетку: під --drafts це норма, бо
  // там весь кластер ще неопублікований.
  for (const text of blockTexts(article)) {
    for (const marker of text.match(TODO_MARKER) ?? []) {
      // Чернетці маркер лишати можна — саме для цього він і потрібен; в ефір ні.
      const message = `${at}: незакритий маркер ${marker}`;
      if (article.published) expect(false, message);
      else warn(message);
    }
  }

  if (article.published && !includeDrafts) {
    // Тема-чернетка серед topics збірку не валить: ArticleRelated фільтрує їх
    // через visibleTopics(), тож посилання просто не зʼявиться. Але автор має
    // знати, що частина перелінковки мовчки не працює.
    for (const slug of article.topics) {
      const topic = topics.find((candidate) => candidate.slug === slug);
      if (topic?.published === false) {
        warn(`${at}: тема «${slug}» ще чернетка — посилання на неї не рендериться`);
      }
    }

    // А от інлайнові посилання ніхто не фільтрує: це сирий href у тексті.
    for (const href of inlineLinks(article)) {
      expect(knownPaths.get(href) !== false, `${at}: посилання «${href}» веде на чернетку`);
    }
  }

  console.log(`ok   ${at}: ${words} слів, ${article.faq.length} FAQ`);
}

console.log(
  failures === 0
    ? `\nУсі перевірки пройдено (статей у реєстрі: ${articles.length}).`
    : `\nПомилок: ${failures}`,
);
process.exit(failures === 0 ? 0 : 1);
