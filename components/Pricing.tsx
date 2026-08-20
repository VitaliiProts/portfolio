import { plans } from '@/lib/content';
import { formatPrice } from '@/lib/site';
import { TelegramLink } from './TelegramLink';
import styles from './Pricing.module.css';

export function Pricing() {
  return (
    <section className={styles.pricing} id="pricing" aria-labelledby="pricing-title">
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow">Сесії та оплата</p>
          <h2 id="pricing-title">
            Прозорі ціни<span className="dot">.</span>
          </h2>
          <p className="lead">
            Без прихованих платежів. Оплата — за добу до зустрічі: так ваш час закріплюється в
            розкладі. Плани змінилися? Просто напишіть мені не пізніше ніж за 24 години.
          </p>
        </div>

        <div className={styles.grid}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`${styles.plan} ${plan.featured ? styles.featured : ''}`}
            >
              <span className={styles.tag}>{plan.tag}</span>
              <h3>{plan.title}</h3>
              <p className={styles.amount}>
                {formatPrice(plan.price)} <small>{plan.unit}</small>
              </p>
              <ul>
                {plan.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <TelegramLink
                href={plan.href}
                source={plan.ctaSource}
                className={`btn ${plan.featured ? 'btn-fill' : 'btn-line'}`}
              >
                Записатися
              </TelegramLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
