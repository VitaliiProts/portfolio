import Image from 'next/image';
import { heroProof } from '@/lib/content';
import { bookingLink } from '@/lib/site';
import { TelegramLink } from './TelegramLink';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className="blob blob-a" aria-hidden="true" />
      <div className="blob blob-b" aria-hidden="true" />

      <div className={`wrap ${styles.inner}`}>
        <div>
          <p className="eyebrow">Психолог · Київ та онлайн</p>
          <h1 id="hero-title">
            Терапія РХП
            <br />і тривоги<span className="dot">.</span>
          </h1>
          <p className={styles.brand}>Крістель Кравець — фахівець з розладів харчової поведінки</p>

          <div className={styles.trust}>
            <div className="stars" aria-hidden="true">
              ★★★★★
            </div>
            <span>8+ років практики · оцінка клієнтів 5/5</span>
          </div>

          <p className="lead">
            Допомагаю з анорексією, булімією, переїданням, тривогою та панічними атаками. Дбайливо,
            конфіденційно, у вашому темпі — онлайн або очно в Києві.
          </p>

          <ul className={styles.proof} aria-label="Ключові переваги">
            {heroProof.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="btns">
            <TelegramLink href={bookingLink} source="hero_cta" className="btn btn-fill">
              Написати в Telegram
            </TelegramLink>
            <a href="#pricing" className="btn btn-line">
              Дивитися ціни
            </a>
          </div>

          <p className={styles.note}>
            Або залиште заявку нижче — <a href="#contact">форма запису</a>. Відповідаю протягом дня.
          </p>
        </div>

        <div className="photo arch-hero">
          <Image
            src="/kristel-portrait.webp"
            alt="Крістель Кравець — психолог і фахівець з розладів харчової поведінки"
            fill
            priority
            sizes="(max-width: 900px) 90vw, 45vw"
          />
        </div>
      </div>
    </section>
  );
}
