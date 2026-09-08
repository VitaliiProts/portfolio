import { faq as siteFaq, type Accordion } from '@/lib/content';
import { AccordionList } from './AccordionList';
import styles from './Faq.module.css';

export function Faq({
  items = siteFaq,
  eyebrow = 'Поширені запитання',
  heading = 'Відповіді на важливі питання',
  lead = 'Про підхід, формат сесій, конфіденційність і оплату.',
}: {
  items?: readonly Accordion[];
  eyebrow?: string;
  heading?: string;
  lead?: string;
} = {}) {
  return (
    <section className={styles.steps} id="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="faq-title">
            {heading}
            <span className="dot">.</span>
          </h2>
          <p className="lead">{lead}</p>
        </div>

        <div className={styles.list}>
          <AccordionList items={items} defaultOpenFirst />
        </div>
      </div>
    </section>
  );
}
