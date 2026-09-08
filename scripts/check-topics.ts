/**
 * Інваріанти реєстру тем. Частина перевірок працює лише для published: true —
 * інакше чернетка блокувала б збірку ще до того, як текст дописано.
 * Запуск: npm run check:topics
 */
import { faq as siteFaq, reviewsByTags } from '../lib/content';
import { testSlugs } from '../lib/tests';
import { REQUIRED_SECTION_IDS, topics } from '../lib/topics';
import type { TopicDefinition } from '../lib/topics/types';

/** Збігається з sectionIds у next.config.ts: ці шляхи зайняті rewrite-ами. */
const RESERVED_SLUGS = [
  'about',
  'certs',
  'services',
  'topics',
  'faq',
  'reviews',
  'pricing',
  'contact',
  'privacy',
  'tests',
];

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

function normalize(question: string): string {
  return question.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function wordCount(topic: TopicDefinition): number {
  const texts = [topic.lead];

  for (const section of topic.sections) {
    for (const block of section.blocks) {
      if (block.type === 'list') texts.push(...block.items);
      else texts.push(block.text);
    }
  }

  return texts.join(' ').split(/\s+/).filter(Boolean).length;
}

console.log('--- структура ---');

const seenSlugs = new Set<string>();
const seenQuestions = new Map<string, string>();

for (const item of siteFaq) {
  seenQuestions.set(normalize(item.question), 'головна');
}

for (const topic of topics) {
  const at = `${topic.slug}`;

  expect(!seenSlugs.has(topic.slug), `${at}: slug дублюється`);
  seenSlugs.add(topic.slug);

  expect(!RESERVED_SLUGS.includes(topic.slug), `${at}: slug зайнятий rewrite-ом або маршрутом`);
  expect(/^[a-z][a-z0-9-]*$/.test(topic.slug), `${at}: slug має бути латиницею через дефіс`);
  expect(/^\d{4}-\d{2}-\d{2}$/.test(topic.updatedAt), `${at}: updatedAt має бути ISO-датою`);

  if (topic.parent) {
    expect(
      topics.some((candidate) => candidate.slug === topic.parent),
      `${at}: parent «${topic.parent}» не існує`,
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

  expect(new Set(sectionIds).size === sectionIds.length, `${at}: id секцій дублюються`);

  for (const section of topic.sections) {
    expect(section.blocks.length > 0, `${at}/${section.id}: порожня секція`);
  }
}

console.log('--- опубліковані сторінки ---');

for (const topic of topics.filter((item) => item.published)) {
  const at = `${topic.slug}`;
  // Хаб оглядає кілька розладів одразу, тому вимога до обсягу вища.
  const isHub = topics.some((candidate) => candidate.parent === topic.slug);
  const minimum = isHub ? 1000 : 800;
  const words = wordCount(topic);

  expect(words >= minimum, `${at}: ${words} слів, потрібно ≥ ${minimum}`);
  expect(topic.title.length <= 60, `${at}: title ${topic.title.length} знаків, максимум 60`);
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
    expect(owner === undefined, `${at}: питання «${item.question}» вже є (${owner})`);
    seenQuestions.set(key, at);
  }

  const matched = reviewsByTags(topic.reviewTags).length;
  const minimumReviews = topic.parent ? 1 : 2;
  expect(
    matched >= minimumReviews,
    `${at}: ${matched} відгуків за тегами, потрібно ≥ ${minimumReviews}`,
  );

  if (topic.requiresSafetyNote) {
    const hasSafety = topic.sections.some((section) =>
      section.blocks.some((block) => block.type === 'callout' && block.tone === 'safety'),
    );
    expect(hasSafety, `${at}: відсутній callout безпеки`);
  }

  console.log(`ok   ${at}: ${words} слів, ${topic.faq.length} FAQ, ${matched} відгуків`);
}

console.log(
  failures === 0
    ? `\nУсі перевірки пройдено (тем у реєстрі: ${topics.length}).`
    : `\nПомилок: ${failures}`,
);
process.exit(failures === 0 ? 0 : 1);
