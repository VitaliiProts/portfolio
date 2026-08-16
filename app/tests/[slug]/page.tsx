import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { TestRunner } from '@/components/tests/TestRunner';
import { buildTestJsonLd } from '@/lib/jsonLd';
import {
  getTest,
  questionsLabel,
  relatedTests,
  testPath,
  testSlugs,
  testsHubPath,
} from '@/lib/tests';
import styles from './page.module.css';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return testSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) return {};

  return {
    title: test.metaTitle,
    description: test.metaDescription,
    alternates: { canonical: testPath(test.slug) },
    openGraph: {
      type: 'article',
      url: testPath(test.slug),
      title: test.metaTitle,
      description: test.metaDescription,
    },
  };
}

export default async function TestPage({ params }: Props) {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) notFound();

  return (
    <section className={styles.page} aria-labelledby="test-title">
      <div className={`wrap ${styles.inner}`}>
        <nav className={styles.crumbs} aria-label="Навігація сторінками">
          <Link href="/">Головна</Link>
          <span aria-hidden="true">·</span>
          <Link href={testsHubPath}>Тести</Link>
        </nav>

        <h1 id="test-title" className={styles.title}>
          {test.title}
          <span className="dot">.</span>
        </h1>

        <p className={styles.meta}>
          {questionsLabel(test.questions.length)} · близько {test.estimatedMinutes} хв ·{' '}
          {test.source}
        </p>

        <div className={styles.intro}>
          {test.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <TestRunner test={test} related={relatedTests(test.slug)} />

        <p className={styles.disclaimer}>
          Тест не ставить діагноз. Він показує рівень симптомів у моменті й не враховує вашої
          історії, обставин і стану здоровʼя — це може зробити лише фахівець під час очної оцінки.
          Якщо результат вас занепокоїв, <Link href="/#contact">напишіть мені</Link>, і ми
          розберемося разом.
        </p>
      </div>

      <JsonLd data={buildTestJsonLd(test)} />
    </section>
  );
}
