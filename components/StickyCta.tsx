import { bookingLink } from '@/lib/site';
import { TelegramLink } from './TelegramLink';
import styles from './StickyCta.module.css';

/** Мобільна панель швидкого запису — головний драйвер конверсії на телефонах. */
export function StickyCta() {
  return (
    <aside className={styles.sticky} aria-label="Швидкий запис">
      <TelegramLink className="btn btn-fill" href={bookingLink} source="sticky">
        Telegram
      </TelegramLink>
      <a className="btn btn-line" href="#pricing">
        Ціни
      </a>
    </aside>
  );
}
