/**
 * Інваріанти реєстру тем. Частина перевірок працює лише для published: true —
 * інакше чернетка блокувала б збірку ще до того, як текст дописано.
 * Запуск: npm run check:topics
 *
 * З --drafts ті самі перевірки застосовуються й до чернеток: так текст можна
 * зміряти до публікації, не перемикаючи прапорці в файлах. Перемикання руками
 * небезпечне — забутий published: true поїхав би в прод разом із чернеткою.
 */
import { faq as siteFaq, reviewsByTags } from '../lib/content';
import { sectionIds } from '../lib/site';
import { testSlugs } from '../lib/tests';
import {
  REQUIRED_SECTION_IDS,
  topics,
  type TopicDefinition,
} from '../lib/topics';

/**
 * Шляхи, зайняті rewrite-ами секцій і статичним сегментом /tests. Список секцій
 * імпортуємо, а не копіюємо: інакше нова секція мовчки перестала б бути
 * зарезервованою і тема з таким slug перекрила б її.
 */
const RESERVED_SLUGS: readonly string[] = [...sectionIds, 'tests'];

/** Без початкових, кінцевих і подвоєних дефісів — те саме правило для slug і для id секцій. */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Збіг slug теми зі slug тесту не забороняємо: `/binge-eating` і
// `/tests/binge-eating` — різні шляхи, колізії маршрутів не виникає.

let failures = 0;

function fail(message: string): void {
  failures += 1;
  console.log(`FAIL ${message}`);
}

function expect(condition: boolean, message: string): void {
  if (condition) return;
  fail(message);
}

/**
 * U+02BC належить до \p{L}, тож наступний вираз його не зачепить. Замінюємо на
 * пробіл — так само, як решту пунктуації, — інакше «привʼязаності» і
 * «прив’язаності» дали б різні ключі.
 */
function normalize(question: string): string {
  return question
    .toLowerCase()
    .replace(/\u02BC/gu, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function wordCount(topic: TopicDefinition): number {
  const texts = [topic.lead];

  for (const section of topic.sections) {
    for (const block of section.blocks) {
      if (block.type === 'list') texts.push(...block.items);
      else texts.push(block.text);
    }
  }

  // Тире й лапки окремими токенами не рахуємо: інакше поріг обсягу занижується.
  return texts
    .join(' ')
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

console.log('--- структура ---');

const seenSlugs = new Set<string>();
const seenQuestions = new Map<string, string>();

for (const item of siteFaq) {
  seenQuestions.set(normalize(item.question), 'головна');
}

for (const topic of topics) {
  const at = topic.slug;

  expect(!seenSlugs.has(topic.slug), `${at}: slug дублюється`);
  seenSlugs.add(topic.slug);

  expect(
    !RESERVED_SLUGS.includes(topic.slug),
    `${at}: slug зайнятий rewrite-ом або маршрутом`,
  );
  expect(
    SLUG_PATTERN.test(topic.slug),
    `${at}: slug має бути латиницею через дефіс`,
  );
  expect(
    /^\d{4}-\d{2}-\d{2}$/.test(topic.updatedAt) &&
      !Number.isNaN(Date.parse(topic.updatedAt)),
    `${at}: updatedAt має бути коректною ISO-датою`,
  );

  if (topic.parent) {
    const parent = topics.find((candidate) => candidate.slug === topic.parent);

    expect(parent !== undefined, `${at}: parent «${topic.parent}» не існує`);
    expect(
      topic.parent !== topic.slug,
      `${at}: тема не може бути власним батьком`,
    );
    // Ієрархія рівно на один рівень: хаб і його діти, без онуків.
    expect(
      parent?.parent === undefined,
      `${at}: parent «${topic.parent}» сам має батька — глибша вкладеність не підтримується`,
    );
  }

  for (const slug of topic.tests) {
    expect(testSlugs.includes(slug), `${at}: тест «${slug}» не існує`);
  }

  const sectionIds = topic.sections.map((section) => section.id);
  const requiredIds: readonly string[] = REQUIRED_SECTION_IDS;
  const required = sectionIds.filter((id) => requiredIds.includes(id));
  expect(
    required.join(',') === REQUIRED_SECTION_IDS.join(','),
    `${at}: обов'язкові секції відсутні або в іншому порядку (маємо ${required.join(',') || '—'})`,
  );

  expect(
    new Set(sectionIds).size === sectionIds.length,
    `${at}: id секцій дублюються`,
  );

  for (const section of topic.sections) {
    expect(section.blocks.length > 0, `${at}/${section.id}: порожня секція`);
    expect(
      SLUG_PATTERN.test(section.id),
      `${at}/${section.id}: id секції має бути латиницею`,
    );
  }
}

const includeDrafts = process.argv.includes('--drafts');

console.log(
  includeDrafts
    ? '--- усі сторінки, разом із чернетками ---'
    : '--- опубліковані сторінки ---',
);

for (const topic of topics.filter((item) => includeDrafts || item.published)) {
  const at = topic.slug;
  // Хаб оглядає кілька розладів одразу, тому вимога до обсягу вища.
  const isHub = topics.some((candidate) => candidate.parent === topic.slug);
  const minimum = isHub ? 1000 : 800;
  const words = wordCount(topic);

  expect(words >= minimum, `${at}: ${words} слів, потрібно ≥ ${minimum}`);
  expect(
    topic.title.length <= 60,
    `${at}: title ${topic.title.length} знаків, максимум 60`,
  );
  expect(
    topic.description.length <= 155,
    `${at}: description ${topic.description.length} знаків, максимум 155`,
  );
  expect(topic.h1 !== topic.title, `${at}: h1 дослівно дорівнює title`);

  expect(
    topic.faq.length >= 3 && topic.faq.length <= 5,
    `${at}: ${topic.faq.length} FAQ, потрібно 3–5`,
  );

  for (const item of topic.faq) {
    const key = normalize(item.question);
    const owner = seenQuestions.get(key);
    expect(
      owner === undefined,
      `${at}: питання «${item.question}» вже є (${owner})`,
    );
    seenQuestions.set(key, at);
  }

  // Інакше на проді крихта опублікованої дитини вела б у 404. Під --drafts не
  // перевіряємо: там неопублікований батько — норма, а не помилка.
  if (topic.parent && !includeDrafts) {
    const parent = topics.find((candidate) => candidate.slug === topic.parent);
    expect(
      parent?.published === true,
      `${at}: батьківська тема «${topic.parent}» не опублікована`,
    );
  }

  const matched = reviewsByTags(topic.reviewTags).length;
  const minimumReviews = topic.parent ? 1 : 2;
  expect(
    matched >= minimumReviews,
    `${at}: ${matched} відгуків за тегами, потрібно ≥ ${minimumReviews}`,
  );

  if (topic.requiresSafetyNote) {
    const hasSafety = topic.sections.some((section) =>
      section.blocks.some(
        (block) => block.type === 'callout' && block.tone === 'safety',
      ),
    );
    expect(hasSafety, `${at}: відсутній callout безпеки`);
  }

  console.log(
    `ok   ${at}: ${words} слів, ${topic.faq.length} FAQ, ${matched} відгуків`,
  );
}

console.log(
  failures === 0
    ? `\nУсі перевірки пройдено (тем у реєстрі: ${topics.length}).`
    : `\nПомилок: ${failures}`,
);
process.exit(failures === 0 ? 0 : 1);
