import Link from 'next/link';
import { site } from '@/lib/site';
import styles from './Privacy.module.css';

export function Privacy() {
  return (
    <section className={styles.privacy} id="privacy" aria-labelledby="privacy-title">
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.head}>
          <p className="eyebrow">Прозорість</p>
          <h2 id="privacy-title">
            Конфіденційність і правила<span className="dot">.</span>
          </h2>
        </div>

        <p className={styles.text}>
          Усі звернення та сесії конфіденційні. Дані не передаю третім особам. Записи сесій не веду
          без вашої згоди. Можна звертатися під псевдонімом.
        </p>
        <p className={styles.text}>
          Оплата — за добу до консультації: цей час я резервую в розкладі лише для вас. Якщо плани
          змінилися, напишіть мені щонайменше за 24 години — перенесемо або скасуємо без втрат.
          Пізніше цього моменту кошти, на жаль, не повертаються, бо годину вже не встигаю
          перепланувати.
        </p>
        <p className={styles.text}>
          Тести в розділі <Link href="/tests">«Тести»</Link> анонімні: відповіді рахуються у вашому
          браузері, не зберігаються й нікуди не надсилаються. Це скринінгові опитувальники, а не
          діагноз.
        </p>
        <p className={styles.text}>
          Якщо стан гострий і потрібна негайна допомога — лінія {site.crisisLine} (безкоштовно,
          цілодобово). Я не замінюю невідкладну медичну чи психіатричну допомогу.
        </p>
      </div>
    </section>
  );
}
