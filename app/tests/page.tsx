import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { buildTestsHubJsonLd } from '@/lib/jsonLd';
import { questionsLabel, testPath, tests } from '@/lib/tests';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Психологічні тести онлайн — тривожність, депресія, РХП',
  description:
    'Сім безкоштовних психологічних тестів: тривожність, депресія, ОКР, стрес, компульсивне переїдання, тип привʼязаності, РХП. Без реєстрації, з поясненням результату.',
  alternates: { canonical: '/tests' },
  openGraph: {
    type: 'website',
    url: '/tests',
    title: 'Психологічні тести онлайн — безкоштовно й без реєстрації',
    description:
      'Тривожність, депресія, ОКР, стрес, переїдання, тип привʼязаності, РХП — сім валідованих методик із поясненням результату.',
  },
};

export default function TestsPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="tests-title">
        <span className="blob blob-b" aria-hidden="true" />
        <div className={`wrap ${styles.heroInner}`}>
          <p className="eyebrow">Тести</p>
          <h1 id="tests-title">
            Психологічні тести<span className="dot">.</span>
          </h1>
          <p className="lead">
            Сім методик, якими користуються психологи в усьому світі. Вони не ставлять діагноз, але
            допомагають зрозуміти, наскільки серйозно те, що з вами відбувається, — і чи час
            звертатися по допомогу.
          </p>
          <p className={styles.note}>
            Відповіді не зберігаються й нікуди не надсилаються: підрахунок відбувається у вашому
            браузері.
          </p>
        </div>
      </section>

      <section className={styles.list} aria-label="Перелік тестів">
        <div className="wrap">
          <ul className={styles.grid}>
            {tests.map((test) => (
              <li key={test.slug}>
                <Link href={testPath(test.slug)} className={styles.card}>
                  <h2 className={styles.cardTitle}>{test.title}</h2>
                  <p className={styles.cardSummary}>{test.summary}</p>
                  <p className={styles.cardMeta}>
                    {questionsLabel(test.questions.length)} · близько {test.estimatedMinutes} хв
                  </p>
                  <span className={styles.cardLink}>
                    Пройти <span className="arw">⟶</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className={styles.disclaimer}>
            Усі тести на цій сторінці — скринінгові опитувальники. Вони показують рівень симптомів у
            моменті й не враховують вашої історії, обставин і стану здоровʼя. Діагноз може поставити
            лише лікар або клінічний психолог після очної оцінки. Якщо результат вас занепокоїв —
            це привід не для паніки, а для розмови з фахівцем.
          </p>
        </div>
      </section>

      <JsonLd data={buildTestsHubJsonLd()} />
    </>
  );
}
