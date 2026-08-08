import { bookingLink } from '@/lib/site';
import styles from './StickyCta.module.css';

/** Мобільна панель швидкого запису — головний драйвер конверсії на телефонах. */
export function StickyCta() {
  return (
    <aside className={styles.sticky} aria-label="Швидкий запис">
      <a className="btn btn-fill" href={bookingLink} target="_blank" rel="noopener noreferrer">
        Telegram
      </a>
      <a className="btn btn-line" href="#pricing">
        Ціни
      </a>
    </aside>
  );
}
