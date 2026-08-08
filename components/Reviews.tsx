'use client';

import { reviews } from '@/lib/content';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { useCarousel } from './useCarousel';
import styles from './Reviews.module.css';

export function Reviews() {
  const { railRef, scrollPrev, scrollNext, atStart, atEnd } = useCarousel<HTMLDivElement>(
    `.${styles.rev}`,
  );

  return (
    <section className={styles.reviews} id="reviews" aria-labelledby="reviews-title">
      <div className="wrap">
        <div className={styles.head}>
          <div>
            <p className={`eyebrow ${styles.eyebrow}`}>Відгуки клієнтів</p>
            <h2 id="reviews-title" className={styles.title}>
              Що кажуть клієнти<span className="dot">.</span>
            </h2>
          </div>
          <div className={styles.nav}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={scrollPrev}
              disabled={atStart}
              aria-label="Попередні відгуки"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={scrollNext}
              disabled={atEnd}
              aria-label="Наступні відгуки"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        <div className={styles.rail} ref={railRef} tabIndex={0} role="group" aria-label="Відгуки клієнтів">
          {reviews.map((review) => (
            <article key={review.quote.slice(0, 40)} className={styles.rev}>
              <span className="stars" aria-hidden="true">
                ★★★★★
              </span>
              <p>{review.quote}</p>
              <div className={styles.who}>
                {review.author}
                <small>{review.topic}</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
