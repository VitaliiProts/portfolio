'use client';

import Image from 'next/image';
import { services } from '@/lib/content';
import { ChevronLeftIcon, ChevronRightIcon, ServiceIcon } from './icons';
import { useCarousel } from './useCarousel';
import styles from './Services.module.css';

export function Services() {
  const { railRef, scrollPrev, scrollNext, atStart, atEnd } = useCarousel<HTMLDivElement>(
    `.${styles.card}`,
  );

  return (
    <section className={styles.services} id="services" aria-labelledby="services-title">
      <div className="wrap">
        <div className={styles.head}>
          <div>
            <p className="eyebrow">З чим працюю</p>
            <h2 id="services-title">
              Запити, з якими звертаються<span className="dot">.</span>
            </h2>
            <p className={`lead ${styles.headLead}`}>
              Я допомагаю з різними видами розладів харчової поведінки (анорексія, булімія,
              компульсивне переїдання), тривожні стани та тривожні розлади, депресія. Також працюю з
              прийняттям себе, кордонами, відносинами та особистісними кризами.
            </p>
          </div>
          <div className="btns">
            <a href="#contact" className="btn btn-fill">
              Обрати час <span className="arw">⟶</span>
            </a>
            <a href="#topics" className="btn btn-line">
              Детальніше
            </a>
          </div>
        </div>

        <div className={styles.railWrap}>
          <button
            type="button"
            className={`${styles.railBtn} ${styles.prev}`}
            onClick={scrollPrev}
            disabled={atStart}
            aria-label="Попередні запити"
          >
            <ChevronLeftIcon />
          </button>

          <div className={styles.rail} ref={railRef} tabIndex={0} role="group" aria-label="Запити, з якими звертаються">
            {services.map((service) => (
              <article key={service.id} className={styles.card}>
                <Image
                  className={styles.bg}
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  sizes="(max-width: 900px) 85vw, 33vw"
                />
                <ServiceIcon name={service.icon} className={styles.ico} />
                <h3>{service.title}</h3>
                <p className={styles.meta}>{service.meta}</p>
                <p className={styles.text}>{service.description}</p>
              </article>
            ))}
          </div>

          <button
            type="button"
            className={`${styles.railBtn} ${styles.next}`}
            onClick={scrollNext}
            disabled={atEnd}
            aria-label="Наступні запити"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
