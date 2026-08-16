'use client';

import { useEffect, useRef } from 'react';
import type { Choice, Question } from '@/lib/tests/types';
import styles from './Test.module.css';

type Props = {
  question: Question;
  choices: readonly Choice[];
  value: number | null;
  onAnswer: (value: number) => void;
};

/**
 * Варіанти — кнопки з роллю radio, а не нативні input: нативна радіогрупа
 * позначає варіант уже на стрілку, а тут вибір одразу гортає далі. Тому
 * стрілки лише переносять фокус, а вибір робить Enter, пробіл або цифра.
 */
export function TestQuestion({ question, choices, value, onAnswer }: Props) {
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    if (!buttons?.length) return;

    // Фокус на початок списку, щоб клавіатура працювала без зайвого Tab.
    const checked = Array.from(buttons).find(
      (button) => button.getAttribute('aria-checked') === 'true',
    );
    (checked ?? buttons[0])?.focus({ preventScroll: true });
  }, [question]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(
      groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [],
    );
    if (buttons.length === 0) return;

    const shortcut = choices[Number(event.key) - 1];
    if (shortcut) {
      event.preventDefault();
      onAnswer(shortcut.value);
      return;
    }

    const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
    const backward = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
    if (!forward && !backward) return;

    event.preventDefault();
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = (current + (forward ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }

  return (
    <div className={styles.question}>
      <h2 className={styles.questionText}>{question.text}</h2>
      {question.hint && <p className={styles.hint}>{question.hint}</p>}

      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={question.text}
        className={styles.choices}
        onKeyDown={handleKeyDown}
      >
        {choices.map((choice, position) => {
          const checked = value === choice.value;

          return (
            <button
              key={choice.label}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked || (value === null && position === 0) ? 0 : -1}
              className={`${styles.choice} ${checked ? styles.choiceActive : ''}`}
              onClick={() => onAnswer(choice.value)}
            >
              <span className={styles.choiceKey} aria-hidden="true">
                {position + 1}
              </span>
              {choice.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
