import { bes } from './bes';
import { dass21 } from './dass21';
import { eat26 } from './eat26';
import { ecrR } from './ecrR';
import { gad7 } from './gad7';
import { phq9 } from './phq9';
import { ybocs } from './ybocs';
import type { TestDefinition } from './types';

/** Порядок визначає видачу на хабі й підбір суміжних тестів. */
export const tests: readonly TestDefinition[] = [gad7, phq9, ybocs, dass21, bes, ecrR, eat26];

export const testSlugs: readonly string[] = tests.map((test) => test.slug);

export function getTest(slug: string): TestDefinition | undefined {
  return tests.find((test) => test.slug === slug);
}

/** Короткий опис тесту для посилань — без питань, щоб не тягнути їх у клієнт. */
export type TestLink = { slug: string; title: string };

/** Наступні тести за колом — щоб з кожної сторінки був вихід у розділ. */
export function relatedTests(slug: string, count = 2): readonly TestLink[] {
  const index = tests.findIndex((test) => test.slug === slug);
  const from = index < 0 ? 0 : index + 1;

  return Array.from({ length: count }, (_, offset) => tests[(from + offset) % tests.length])
    .filter((test): test is TestDefinition => test !== undefined)
    .map((test) => ({ slug: test.slug, title: test.title }));
}

export { questionsLabel, testPath, testsHubPath } from './format';
export type { TestDefinition };
