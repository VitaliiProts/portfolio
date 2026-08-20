import { freeConsultLink } from '@/lib/site';
import { TelegramLink } from './TelegramLink';
import styles from './FreeConsultation.module.css';

export function FreeConsultation() {
  return (
    <section className={styles.section} id="free-consult" aria-labelledby="free-consult-title">
      <div className={`wrap ${styles.inner}`}>
        <span className={styles.badge}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          15 хвилин — безкоштовно
        </span>

        <h2 id="free-consult-title" className={styles.title}>
          Пробна консультація<span className="dot">.</span>
        </h2>

        <p className={styles.desc}>
          Познайомимось, обговоримо ваш запит і зрозуміємо, чи підходить вам мій підхід — без
          зобов&#8217;язань і оплати.
        </p>

        <ul className={styles.bullets}>
          <li>Онлайн або в Києві</li>
          <li>Конфіденційно</li>
          <li>Без зобов&#8217;язань</li>
        </ul>

        <TelegramLink
          href={freeConsultLink}
          source="free_consult_cta"
          className={`btn btn-fill ${styles.cta}`}
        >
          Записатися на пробну сесію
        </TelegramLink>

        <p className={styles.note}>Відповідаю протягом дня</p>
      </div>
    </section>
  );
}
