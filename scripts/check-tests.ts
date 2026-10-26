/**
 * Разова перевірка ключів підрахунку: крайні випадки й контрольні приклади
 * з першоджерел. Запуск: npx tsx scripts/check-tests.ts
 */
import { tests } from '../lib/tests';
import { choicesFor, computeResult } from '../lib/tests/scoring';
import type { TestDefinition } from '../lib/tests/types';

let failures = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${JSON.stringify(actual)} (очікувано ${JSON.stringify(expected)})`);
}

function extreme(test: TestDefinition, pick: (values: number[]) => number) {
  return test.questions.map((_, index) => pick(choicesFor(test, index).map((choice) => choice.value)));
}

console.log('--- межі шкал ---');
for (const test of tests) {
  const low = computeResult(test, extreme(test, (values) => Math.min(...values)));
  const high = computeResult(test, extreme(test, (values) => Math.max(...values)));

  for (const scale of low.scales) {
    const top = high.scales.find((item) => item.id === scale.id);
    console.log(
      `${test.slug}/${scale.id}: ${scale.score}..${top?.score} (діапазон шкали ${scale.min}..${scale.max})`,
    );
  }
}

console.log('\n--- контрольні значення ---');

const gad7 = tests.find((test) => test.slug === 'anxiety')!;
check('GAD-7 максимум', computeResult(gad7, Array(7).fill(3)).scales[0]?.score, 21);
check('GAD-7 діапазон при 10', computeResult(gad7, [3, 3, 2, 2, 0, 0, 0]).scales[0]?.band.id, 'moderate');

const phq9 = tests.find((test) => test.slug === 'depression')!;
check('PHQ-9 максимум', computeResult(phq9, Array(9).fill(3)).scales[0]?.score, 27);
check(
  'PHQ-9 кризовий маркер при ненульовому 9-му пункті',
  computeResult(phq9, [0, 0, 0, 0, 0, 0, 0, 0, 1]).crisis,
  true,
);
check('PHQ-9 без кризи при нулях', computeResult(phq9, Array(9).fill(0)).crisis, false);

const ybocs = tests.find((test) => test.slug === 'ocd')!;
check('Y-BOCS максимум', computeResult(ybocs, Array(10).fill(4)).scales[0]?.score, 40);

const dass21 = tests.find((test) => test.slug === 'dass21')!;
const dassAnswers = [2, 0, 1, 1, 2, 2, 1, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 2, 1, 0, 1];
const dass = computeResult(dass21, dassAnswers);
check('DASS-21 депресія (приклад: сира сума 10 × 2)', dass.scales[0]?.score, 20);
check('DASS-21 тривога (приклад: сира сума 4 × 2)', dass.scales[1]?.score, 8);
check('DASS-21 стрес (приклад: сира сума 12 × 2)', dass.scales[2]?.score, 24);
check('DASS-21 депресія — діапазон', dass.scales[0]?.band.id, 'moderate');
check('DASS-21 тривога — діапазон', dass.scales[1]?.band.id, 'mild');
check('DASS-21 стрес — діапазон', dass.scales[2]?.band.id, 'moderate');

const bes = tests.find((test) => test.slug === 'binge-eating')!;
check('BES максимум', computeResult(bes, extreme(bes, (values) => Math.max(...values))).scales[0]?.score, 46);

const ecrR = tests.find((test) => test.slug === 'attachment')!;
// Приклад Fraley: очікувані значення 2.33 і 2.17.
const chris = [
  1, 2, 2, 1, 3, 2, 2, 2, 1, 1, 6, 2, 2, 2, 3, 2, 5, 1, 2, 5, 2, 5, 2, 4, 2, 6, 6, 7, 7, 5, 6, 2, 6,
  6, 6, 6,
];
const ecr = computeResult(ecrR, chris);
check('ECR-R тривожність (приклад Fraley)', ecr.scales[0]?.score, 2.3);
check('ECR-R уникання (приклад Fraley)', ecr.scales[1]?.score, 2.2);
check('ECR-R тип при низьких значеннях', ecr.style?.label, 'Надійний тип прив’язаності');

const eat26 = tests.find((test) => test.slug === 'eat26')!;
// У пункті 26 шкала інвертована: «Ніколи» важить 3, «Завжди» — 0.
const never = eat26.questions.map((_, index) => (index === 25 ? 3 : 0));
check('EAT-26 «ніколи» скрізь (пункт 26 дає 3)', computeResult(eat26, never).scales[0]?.score, 3);
const always = eat26.questions.map((_, index) => (index === 25 ? 0 : index < 26 ? 3 : 0));
check('EAT-26 «завжди» скрізь (пункт 26 дає 0)', computeResult(eat26, always).scales[0]?.score, 75);
check(
  'EAT-26 поріг 20 при «завжди» скрізь',
  computeResult(eat26, always).scales[0]?.band.id,
  'above-cutoff',
);
check('EAT-26 нижче порогу при «ніколи»', computeResult(eat26, never).scales[0]?.band.id, 'below-cutoff');
check(
  'EAT-26 поведінковий маркер при низькому балі',
  computeResult(
    eat26,
    eat26.questions.map((_, index) => (index === 27 ? 1 : 0)),
  ).behavior,
  true,
);

console.log(failures === 0 ? '\nУсі перевірки пройдено.' : `\nПомилок: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
