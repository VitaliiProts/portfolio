import { site } from '@/lib/site';
import styles from './CrisisBar.module.css';

export function CrisisBar() {
  return (
    <div className={styles.crisis} role="note">
      Якщо стан гострий і допомога потрібна просто зараз —{' '}
      <b>Лінія запобігання самогубствам {site.crisisLine}</b> (безкоштовно, цілодобово).
    </div>
  );
}
