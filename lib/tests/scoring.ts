import type {
  Band,
  Choice,
  Question,
  ScaleResult,
  Subscale,
  TestDefinition,
  TestResult,
} from './types';

export type Answers = readonly (number | null)[];

export function choicesFor(test: TestDefinition, questionIndex: number): readonly Choice[] {
  return test.questions[questionIndex]?.choices ?? test.choices ?? [];
}

/**
 * Зворотні пункти дзеркалять шкалу: ECR-R рахує `8 - value`, EAT-26 — `3 - value`.
 * Межі беремо з варіантів самого питання, щоб формула не залежала від тесту.
 */
function scoredValue(question: Question, choices: readonly Choice[], raw: number): number {
  if (!question.reverse) return raw;

  const values = choices.map((choice) => choice.value);
  return Math.min(...values) + Math.max(...values) - raw;
}

function bounds(choices: readonly Choice[]): { min: number; max: number } {
  const values = choices.map((choice) => choice.value);
  return { min: Math.min(...values), max: Math.max(...values) };
}

function findBand(bands: readonly Band[], score: number): Band {
  const band = bands.find((item) => score <= item.max) ?? bands.at(-1);
  if (!band) throw new Error('Підшкала описана без діапазонів результату');
  return band;
}

function transform(subscale: Subscale, raw: number): number {
  if (subscale.mode === 'mean') {
    return Math.round((raw / subscale.items.length) * 10) / 10;
  }
  return raw * (subscale.factor ?? 1);
}

function scoreSubscale(
  test: TestDefinition,
  subscale: Subscale,
  answers: Answers,
): { score: number; min: number; max: number } {
  let raw = 0;
  let rawMin = 0;
  let rawMax = 0;

  for (const number of subscale.items) {
    const index = number - 1;
    const question = test.questions[index];
    if (!question) continue;

    const choices = choicesFor(test, index);
    const limits = bounds(choices);

    rawMin += limits.min;
    rawMax += limits.max;
    raw += scoredValue(question, choices, answers[index] ?? limits.min);
  }

  return {
    score: transform(subscale, raw),
    min: transform(subscale, rawMin),
    max: transform(subscale, rawMax),
  };
}

/** Смужка результату малюється з діапазонів, тому їхні межі рахуємо один раз. */
function buildSegments(
  subscale: Subscale,
  min: number,
  max: number,
): ScaleResult['segments'] {
  let from = min;

  return subscale.bands.map((band) => {
    const to = Math.min(band.max, max);
    const segment = { id: band.id, label: band.label, tone: band.tone, from, to };
    from = to;
    return segment;
  });
}

function hasFlag(test: TestDefinition, answers: Answers, flag: 'crisis' | 'behavior'): boolean {
  return test.questions.some((question, index) => {
    if (question.flag !== flag) return false;
    const answer = answers[index];
    return typeof answer === 'number' && answer > 0;
  });
}

export function computeResult(test: TestDefinition, answers: Answers): TestResult {
  const scales: ScaleResult[] = test.subscales.map((subscale) => {
    const { score, min, max } = scoreSubscale(test, subscale, answers);

    return {
      id: subscale.id,
      title: subscale.title,
      score,
      min,
      max,
      band: findBand(subscale.bands, score),
      segments: buildSegments(subscale, min, max),
    };
  });

  const alert = scales.some((scale) => scale.band.tone === 'alert');

  return {
    scales,
    crisis: hasFlag(test, answers, 'crisis') || (test.crisisOnAlert === true && alert),
    behavior: hasFlag(test, answers, 'behavior'),
    style: resolveStyle(test, scales),
  };
}

function resolveStyle(
  test: TestDefinition,
  scales: readonly ScaleResult[],
): TestResult['style'] {
  const rule = test.quadrant;
  if (!rule) return undefined;

  const anxiety = scales.find((scale) => scale.id === rule.anxietyScaleId);
  const avoidance = scales.find((scale) => scale.id === rule.avoidanceScaleId);
  if (!anxiety || !avoidance) return undefined;

  const highAnxiety = anxiety.score >= rule.threshold;
  const highAvoidance = avoidance.score >= rule.threshold;

  if (!highAnxiety && !highAvoidance) return rule.styles.lowLow;
  if (highAnxiety && !highAvoidance) return rule.styles.highLow;
  if (!highAnxiety && highAvoidance) return rule.styles.lowHigh;
  return rule.styles.highHigh;
}

/** Ідентифікатори діапазонів для аналітики: у події йде рівень, а не відповіді. */
export function resultBands(result: TestResult): Record<string, string> {
  return Object.fromEntries(result.scales.map((scale) => [scale.id, scale.band.id]));
}
