'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { testPath, testsHubPath } from '@/lib/tests/format';
import type { ScaleResult, TestDefinition, TestResult as Result } from '@/lib/tests/types';
import { site, telegramLink } from '@/lib/site';
import { TelegramLink } from '../TelegramLink';
import styles from './Test.module.css';

type Props = {
  test: TestDefinition;
  result: Result;
  related: readonly { slug: string; title: string }[];
  onRestart: () => void;
};

function formatScore(value: number): string {
  return String(value).replace('.', ',');
}

const toneClass: Record<string, string | undefined> = {
  calm: styles.toneCalm,
  watch: styles.toneWatch,
  alert: styles.toneAlert,
};

function ScaleBar({ scale }: { scale: ScaleResult }) {
  const span = scale.max - scale.min || 1;
  const position = ((scale.score - scale.min) / span) * 100;

  return (
    <div>
      <div className={styles.scaleHead}>
        <h3 className={styles.scaleTitle}>{scale.title}</h3>
        <p className={styles.scaleScore}>
          {formatScore(scale.score)}
          <span> з {formatScore(scale.max)}</span>
        </p>
      </div>

      <div className={styles.bar}>
        {scale.segments.map((segment) => (
          <span
            key={segment.id}
            className={`${styles.segment} ${toneClass[segment.tone] ?? ''}`}
            style={{ flexGrow: Math.max(segment.to - segment.from, 0.001) }}
            title={segment.label}
          />
        ))}
        <span className={styles.marker} style={{ left: `${position}%` }} aria-hidden="true" />
      </div>

      <p className={`${styles.bandLabel} ${toneClass[scale.band.tone] ?? ''}`}>{scale.band.label}</p>
      <p className={styles.bandText}>{scale.band.text}</p>
    </div>
  );
}

export function TestResult({ test, result, related, onRestart }: Props) {
  const bookingText = `Вітаю! Пройшла на сайті «${test.title}» і хочу записатися на консультацію.`;
  const ref = useRef<HTMLElement>(null);

  // Останнє питання змінюється результатом на тому ж місці: без переносу фокуса
  // екранний диктор лишиться на кнопці, якої вже немає.
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section ref={ref} tabIndex={-1} aria-labelledby="test-result-title">
      <p className="eyebrow">Результат</p>
      <h2 id="test-result-title" className={styles.resultTitle}>
        {test.title}
        <span className="dot">.</span>
      </h2>

      {result.crisis && (
        <div className={styles.crisis} role="note">
          <b>Якщо зараз важко — не залишайтеся з цим наодинці.</b> Ви відзначили відповідь, яка
          вимагає уваги вже сьогодні. Лінія запобігання самогубствам — {site.crisisLine},
          безкоштовно й цілодобово. Якщо стан гострий, зверніться по невідкладну допомогу.
        </div>
      )}

      <div className={styles.scales}>
        {result.scales.map((scale) => (
          <ScaleBar key={scale.id} scale={scale} />
        ))}
      </div>

      {result.style && (
        <div className={styles.style}>
          <h3 className={styles.scaleTitle}>{result.style.label}</h3>
          <p className={styles.bandText}>{result.style.text}</p>
        </div>
      )}

      {result.behavior && test.behaviorNote && (
        <div className={styles.behavior} role="note">
          <b>Поведінкові маркери.</b> {test.behaviorNote}
        </div>
      )}

      <p className={styles.disclaimer}>
        Це скринінговий опитувальник, а не діагноз. Він показує рівень симптомів у моменті й не
        враховує вашої історії, обставин і стану здоровʼя. Діагноз може поставити лише лікар або
        клінічний психолог після очної оцінки. Методика: {test.source}.
      </p>

      <div className={`btns ${styles.actions}`}>
        <TelegramLink
          className="btn btn-fill"
          href={telegramLink(bookingText)}
          source="test_result_cta"
          testSlug={test.slug}
        >
          Обговорити результат <span className="arw">⟶</span>
        </TelegramLink>
        <button type="button" className="btn btn-line" onClick={onRestart}>
          Пройти ще раз
        </button>
      </div>

      <div className={styles.related}>
        <p className={styles.relatedTitle}>Інші тести</p>
        <ul>
          {related.map((item) => (
            <li key={item.slug}>
              <Link href={testPath(item.slug)}>{item.title}</Link>
            </li>
          ))}
          <li>
            <Link href={testsHubPath}>Усі тести</Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
