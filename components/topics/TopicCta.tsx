import { TelegramLink } from '@/components/TelegramLink';
import { telegramLink } from '@/lib/site';
import styles from './TopicPage.module.css';

/** Повідомлення заздалегідь називає тему, щоб перша репліка в чаті була по суті. */
export function TopicCta({ message }: { message: string }) {
  return (
    <section className={styles.cta} aria-labelledby="topic-cta-title">
      <h2 id="topic-cta-title">Записатися на сесію</h2>
      <p>
        Напишіть мені в Telegram — відповім і разом визначимо, з чого почати. Перше повідомлення
        вже буде заповнене, його можна змінити.
      </p>
      <TelegramLink href={telegramLink(message)} source="topic_cta" className="btn btn-fill">
        Написати мені <span className="arw">&#x27F6;</span>
      </TelegramLink>
    </section>
  );
}
