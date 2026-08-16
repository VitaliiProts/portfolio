import Link from 'next/link';
import { footerSections, footerTopics } from '@/lib/content';
import { site } from '@/lib/site';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.foot}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.about}>
            <Logo />
            <p>
              Психолог, гештальт-терапевт у процесі сертифікації, фахівець з розладів харчової
              поведінки. Онлайн і офлайн у Києві. Робота з дорослими та підлітками.
            </p>
            <SocialLinks />
          </div>

          <nav aria-label="Розділи сайту">
            <h2 className={styles.colTitle}>Розділи</h2>
            <ul>
              {footerSections.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Популярні запити">
            <h2 className={styles.colTitle}>Запити</h2>
            <ul>
              {footerTopics.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>
            © {year} {site.shortName}. Приватна практика.
          </span>
          <span>
            <Link href="/#privacy">Конфіденційність і правила</Link> ·{' '}
            <Link href="/#pricing">Ціни</Link> · <Link href="/#contact">Запис</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
