import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Сторінку не знайдено',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className={styles.notFound}>
      <div className={`wrap ${styles.inner}`}>
        <p className="eyebrow">Помилка 404</p>
        <h1>
          Сторінку не знайдено<span className="dot">.</span>
        </h1>
        <p className={`lead ${styles.lead}`}>
          Схоже, такої сторінки не існує. Поверніться на головну — там усе про терапію, ціни та
          запис.
        </p>
        <Link href="/" className="btn btn-fill">
          На головну <span className="arw">⟶</span>
        </Link>
      </div>
    </section>
  );
}
