import { formatPrice, prices, site, bookingLink } from '@/lib/site';
import { BookingForm } from './BookingForm';
import { PhoneIcon, PinIcon, WalletIcon } from './icons';
import styles from './Contact.module.css';

export function Contact() {
  return (
    <section className={styles.contact} id="contact" aria-labelledby="contact-title">
      <div className="blob blob-b" aria-hidden="true" />

      <div className={`wrap ${styles.inner}`}>
        <div>
          <p className="eyebrow">Запис на консультацію</p>
          <h2 id="contact-title">
            Запишіться сьогодні<span className="dot">.</span>
          </h2>
          <p className="lead">
            Напишіть у Telegram або залиште заявку. Відповідаю протягом дня, узгоджуємо час і формат.
            Усі звернення конфіденційні.
          </p>

          <div className={styles.info}>
            <div className={styles.infoRow}>
              <PhoneIcon />
              <div>
                <b>
                  <a href={site.telegramUrl} target="_blank" rel="noopener noreferrer">
                    @{site.telegramHandle}
                  </a>
                </b>
                <span>Найшвидший спосіб записатися — Telegram</span>
              </div>
            </div>

            <div className={styles.infoRow}>
              <PinIcon />
              <div>
                <b>Онлайн і Київ</b>
                <span>Відеозв’язок / месенджери або очна сесія</span>
              </div>
            </div>

            <div className={styles.infoRow}>
              <WalletIcon />
              <div>
                <b>від {formatPrice(prices.individual)}</b>
                <span>Оплата мінімум за 24 години до сесії</span>
              </div>
            </div>
          </div>

          <div className={`btns ${styles.actions}`}>
            <a href={bookingLink} className="btn btn-fill" target="_blank" rel="noopener noreferrer">
              Відкрити Telegram <span className="arw">⟶</span>
            </a>
          </div>
        </div>

        <BookingForm />
      </div>
    </section>
  );
}
