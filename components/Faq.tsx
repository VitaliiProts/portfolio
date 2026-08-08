import { faq } from '@/lib/content';
import { AccordionList } from './AccordionList';
import styles from './Faq.module.css';

export function Faq() {
  return (
    <section className={styles.steps} id="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow">Поширені запитання</p>
          <h2 id="faq-title">
            Відповіді на важливі питання<span className="dot">.</span>
          </h2>
          <p className="lead">Про підхід, формат сесій, конфіденційність і оплату.</p>
        </div>

        <div className={styles.list}>
          <AccordionList items={faq} defaultOpenFirst />
        </div>
      </div>
    </section>
  );
}
