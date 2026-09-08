import Link from 'next/link';
import { questionsLabel, testPath, tests } from '@/lib/tests';
import styles from './TopicPage.module.css';

export function TopicTests({ slugs }: { slugs: readonly string[] }) {
  const items = slugs
    .map((slug) => tests.find((test) => test.slug === slug))
    .filter((test) => test !== undefined);

  if (items.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby="topic-tests-title">
      <h2 id="topic-tests-title">Перевірити себе</h2>

      <ul>
        {items.map((test) => (
          <li key={test.slug}>
            <Link href={testPath(test.slug)}>{test.title}</Link>
            {/* Один шаблонний рядок, а не кілька JSX-виразів: інакше перенос
                рядка відірвав би «~» від числа. Речення — те саме, що в llms.txt. */}
            <p>{`${test.summary} ${test.source}, ${questionsLabel(test.questions.length)}, ~${test.estimatedMinutes} хв.`}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
