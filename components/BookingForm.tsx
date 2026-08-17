'use client';

import { useId, useState, type FormEvent } from 'react';
import { trackTelegramClick } from '@/lib/analytics';
import { attributionSuffix } from '@/lib/attribution';
import { contactSubjects } from '@/lib/content';
import { telegramLink } from '@/lib/site';
import styles from './Contact.module.css';

type Errors = Partial<Record<'name' | 'contact', string>>;

export function BookingForm() {
  const id = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const contact = String(data.get('contact') ?? '').trim();
    const subject = String(data.get('subject') ?? '');
    const message = String(data.get('message') ?? '').trim();

    const nextErrors: Errors = {};
    if (!name) nextErrors.name = 'Вкажіть, як до вас звертатися.';
    if (!contact) nextErrors.contact = 'Залиште контакт, щоб я могла відповісти.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const text = [
      'Вітаю! Хочу записатися на консультацію.',
      `Ім'я: ${name}`,
      `Контакт: ${contact}`,
      `Запит: ${subject}`,
      message && `Деталі: ${message}`,
    ]
      .filter(Boolean)
      .join('\n');

    setSent(true);
    trackTelegramClick('contact_form');
    window.open(telegramLink(text + attributionSuffix()), '_blank', 'noopener,noreferrer');
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor={`${id}-name`}>Ім&apos;я</label>
        <input
          id={`${id}-name`}
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Як до вас звертатися (можна псевдонім)"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
        />
        {errors.name && (
          <p id={`${id}-name-error`} className={styles.error} role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-contact`}>Телефон або Telegram</label>
        <input
          id={`${id}-contact`}
          name="contact"
          type="text"
          autoComplete="tel"
          placeholder="@username або +380…"
          aria-invalid={Boolean(errors.contact)}
          aria-describedby={errors.contact ? `${id}-contact-error` : undefined}
        />
        {errors.contact && (
          <p id={`${id}-contact-error`} className={styles.error} role="alert">
            {errors.contact}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-subject`}>З чим потрібна допомога</label>
        <select id={`${id}-subject`} name="subject" defaultValue={contactSubjects[0]}>
          {contactSubjects.map((subject) => (
            <option key={subject}>{subject}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-message`}>Коротко про запит</label>
        <textarea
          id={`${id}-message`}
          name="message"
          placeholder="Кілька речень — цього достатньо"
        />
      </div>

      <button type="submit" className={`btn btn-fill ${styles.submit}`}>
        Надіслати в Telegram <span className="arw">⟶</span>
      </button>

      <p className={styles.note}>
        Заявка відкриє Telegram із готовим текстом. Ні до чого не зобов’язує.{' '}
        <a href="#privacy">Конфіденційність</a>.
      </p>

      <p className={styles.sent} role="status" aria-live="polite">
        {sent && 'Дякую. Відкриваю Telegram — надішліть повідомлення, і я відповім.'}
      </p>
    </form>
  );
}
