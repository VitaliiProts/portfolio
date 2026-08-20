import Image from 'next/image';
import { topics } from '@/lib/content';
import { AccordionList } from './AccordionList';
import styles from './Topics.module.css';

export function Topics() {
  return (
    <section className={styles.reach} id="topics" aria-labelledby="topics-title">
      <div className="blob blob-b" aria-hidden="true" />

      <div className={`wrap ${styles.inner}`}>
        <div>
          <p className="eyebrow">Коли варто прийти</p>
          <h2 id="topics-title">
            З чим я можу
            <br />
            допомогти<span className="dot">.</span>
          </h2>
          <p className={`lead ${styles.lead}`}>
            Не обов&#8217;язково чекати, поки стане нестерпно. Ось із чим найчастіше звертаються.
          </p>

          <AccordionList items={topics} defaultOpenFirst />

          <div className={`btns ${styles.actions}`}>
            <a href="#contact" className="btn btn-fill">
              Написати мені <span className="arw">&#x27F6;</span>
            </a>
          </div>
        </div>

        <div className="photo arch-leaf cert-frame">
          <Image
            src="/kristel-sertifikat7.webp"
            alt="Сертифікат — гештальт-підхід у роботі з панічними атаками"
            fill
            sizes="(max-width: 900px) 90vw, 45vw"
          />
        </div>
      </div>
    </section>
  );
}
