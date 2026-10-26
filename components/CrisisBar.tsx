import { site } from '@/lib/site';
import styles from './CrisisBar.module.css';

export function CrisisBar() {
  return (
    <aside className={styles.crisis} aria-label="Невідкладна допомога">
      Якщо стан гострий і допомога потрібна просто зараз —{' '}
      <b>
        Лінія запобігання самогубствам <a href={`tel:${site.crisisLine}`}>{site.crisisLine}</a>
      </b>{' '}
      (безкоштовно, цілодобово). Якщо є загроза життю — <a href="tel:103">103</a> або{' '}
      <a href="tel:112">112</a>.
    </aside>
  );
}
