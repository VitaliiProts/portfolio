'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { trackTestCompleted, trackTestStarted } from '@/lib/analytics';
import { questionsLabel } from '@/lib/tests/format';
import { choicesFor, computeResult, resultBands, type Answers } from '@/lib/tests/scoring';
import type { TestDefinition, TestResult as Result } from '@/lib/tests/types';
import { TestQuestion } from './TestQuestion';
import { TestResult } from './TestResult';
import styles from './Test.module.css';

type Phase = 'idle' | 'running' | 'done';

type Saved = { answers: (number | null)[]; index: number };

/** Пауза між вибором відповіді й наступним питанням — щоб вибір встиг зчитатися. */
const ADVANCE_DELAY = 160;

function emptyAnswers(test: TestDefinition): (number | null)[] {
  return test.questions.map(() => null);
}

function storageKey(slug: string): string {
  return `test-progress:${slug}`;
}

function readStorage(slug: string): string | null {
  try {
    return sessionStorage.getItem(storageKey(slug));
  } catch {
    // Приватний режим або заблоковане сховище.
    return null;
  }
}

function parseSaved(raw: string | null, test: TestDefinition): Saved | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Saved;
    const valid =
      Array.isArray(parsed.answers) &&
      parsed.answers.length === test.questions.length &&
      parsed.answers.some((answer) => answer !== null);

    return valid ? parsed : null;
  } catch {
    return null;
  }
}

/** Порожня підписка: сховище змінює лише цей компонент, зовнішніх джерел немає. */
function subscribe(): () => void {
  return () => {};
}

type Props = {
  test: TestDefinition;
  /** Готуємо на сервері: інакше в бандл потрапили б усі визначення тестів. */
  related: readonly { slug: string; title: string }[];
};

export function TestRunner({ test, related }: Props) {
  const total = test.questions.length;
  const [phase, setPhase] = useState<Phase>('idle');
  const [answers, setAnswers] = useState<(number | null)[]>(() => emptyAnswers(test));
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runnerRef = useRef<HTMLDivElement>(null);

  // Прогрес читаємо як зовнішнє джерело: на сервері його немає, а після
  // гідратації він зʼявляється без розсинхрону розмітки.
  const storedRaw = useSyncExternalStore(
    subscribe,
    () => readStorage(test.slug),
    () => null,
  );
  const saved = useMemo(() => parseSaved(storedRaw, test), [storedRaw, test]);

  useEffect(() => {
    if (phase !== 'running') return;

    try {
      sessionStorage.setItem(storageKey(test.slug), JSON.stringify({ answers, index }));
    } catch {
      // Тест працює й без збереження прогресу.
    }
  }, [answers, index, phase, test.slug]);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    [],
  );

  const finish = useCallback(
    (finalAnswers: Answers) => {
      const computed = computeResult(test, finalAnswers);
      setResult(computed);
      setPhase('done');
      trackTestCompleted(test.slug, resultBands(computed));

      try {
        sessionStorage.removeItem(storageKey(test.slug));
      } catch {
        // Результат уже показано.
      }
    },
    [test],
  );

  function start(from: Saved | null) {
    setAnswers(from?.answers ?? emptyAnswers(test));
    setIndex(from?.index ?? 0);
    setResult(null);
    setPhase('running');
    trackTestStarted(test.slug);
    runnerRef.current?.scrollIntoView({ block: 'start' });
  }

  function handleAnswer(value: number) {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);

    if (index + 1 >= total) {
      finish(next);
      return;
    }

    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => setIndex((current) => current + 1), ADVANCE_DELAY);
  }

  if (phase === 'done' && result) {
    return (
      <div ref={runnerRef} className={styles.runner}>
        <TestResult
          test={test}
          result={result}
          related={related}
          onRestart={() => start(null)}
        />
      </div>
    );
  }

  if (phase === 'idle') {
    return (
      <div ref={runnerRef} className={styles.runner}>
        <p className={styles.meta}>
          {questionsLabel(total)} · близько {test.estimatedMinutes} хв · без реєстрації
        </p>
        <p className={styles.instruction}>{test.instruction}</p>

        <div className="btns">
          <button type="button" className="btn btn-fill" onClick={() => start(null)}>
            Почати тест <span className="arw">⟶</span>
          </button>
          {saved && (
            <button type="button" className="btn btn-line" onClick={() => start(saved)}>
              Продовжити з питання {Math.min(saved.index + 1, total)}
            </button>
          )}
        </div>

        <p className={styles.privacy}>
          Відповіді не зберігаються й нікуди не надсилаються — підрахунок відбувається у вашому
          браузері.
        </p>
      </div>
    );
  }

  const question = test.questions[index];
  if (!question) return null;

  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <div ref={runnerRef} className={styles.runner}>
      <div className={styles.progress}>
        <p className={styles.counter} aria-live="polite">
          Питання {index + 1} з {total}
        </p>
        <div
          className={styles.track}
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Прогрес проходження тесту"
        >
          <span className={styles.fill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <p className={styles.instruction}>{test.instruction}</p>

      <TestQuestion
        question={question}
        choices={choicesFor(test, index)}
        value={answers[index] ?? null}
        onAnswer={handleAnswer}
      />

      <div className={styles.nav}>
        <button
          type="button"
          className={styles.back}
          onClick={() => setIndex((current) => Math.max(current - 1, 0))}
          disabled={index === 0}
        >
          ← Назад
        </button>
        <button type="button" className={styles.back} onClick={() => setPhase('idle')}>
          Зупинити
        </button>
      </div>
    </div>
  );
}
