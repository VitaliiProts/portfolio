import { TelegramLink } from '@/components/TelegramLink';
import { telegramLink } from '@/lib/site';
import shared from '@/components/topics/TopicPage.module.css';

/**
 * Блок «Якщо ви впізнали себе» замість загального заклику: людина дочитала
 * текст про конкретний стан, і запрошення має продовжувати саме цю розмову.
 *
 * У посилання не додається нічого про тему статті чи стан читача — лише текст
 * першого повідомлення, який людина бачить і може змінити перед відправкою.
 */
export function ArticleCta({ message }: { message: string }) {
  return (
    <section className={shared.cta} aria-labelledby="article-cta-title">
      <h2 id="article-cta-title">Якщо ви впізнали себе</h2>
      <p>
        Упізнати себе в тексті — це вже багато, і поспішати нікуди. Коли будете готові,
        напишіть мені в Telegram: відповім і разом визначимо, з чого почати. Перше
        повідомлення вже буде заповнене, його можна змінити.
      </p>
      <TelegramLink href={telegramLink(message)} source="article_cta" className="btn btn-fill">
        Написати мені <span className="arw">&#x27F6;</span>
      </TelegramLink>
    </section>
  );
}
