import { formatPrice, prices, site, bookingLink } from '@/lib/site';
import { BookingForm } from './BookingForm';
import { PhoneIcon, PinIcon, WalletIcon } from './icons';
import { TelegramLink } from './TelegramLink';
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
                  <TelegramLink href={site.telegramUrl} source="contact_handle">
                    @{site.telegramHandle}
                  </TelegramLink>
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
                <span>Оплата напередодні — так час залишається за вами</span>
              </div>
            </div>
          </div>

          <div className={`btns ${styles.actions}`}>
            <TelegramLink href={bookingLink} source="contact_cta" className="btn btn-fill">
              Відкрити Telegram <span className="arw">⟶</span>
            </TelegramLink>
          </div>
        </div>

        <BookingForm />
      </div>
    </section>
  );
}
