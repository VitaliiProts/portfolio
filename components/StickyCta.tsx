import Link from 'next/link';
import { bookingLink } from '@/lib/site';
import { TelegramLink } from './TelegramLink';
import styles from './StickyCta.module.css';

/** Мобільна панель швидкого запису — головний драйвер конверсії на телефонах. */
export function StickyCta() {
  return (
    <aside className={styles.sticky} aria-label="Швидкий запис">
      <TelegramLink className="btn btn-fill" href={bookingLink} source="sticky_cta">
        Telegram
      </TelegramLink>
      <Link className="btn btn-line" href="/#pricing">
        Ціни
      </Link>
    </aside>
  );
}
