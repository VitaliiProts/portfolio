import Image from 'next/image';
import { aboutParagraphs, credentials, features, stats } from '@/lib/content';
import { FeatureIcon } from './icons';
import styles from './About.module.css';

export function About() {
  return (
    <section className={styles.about} id="about" aria-labelledby="about-title">
      <div className="blob blob-a" aria-hidden="true" />

      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.grid}>
          <div className={styles.photos}>
            <div className="photo arch-top">
              <Image
                src="/kristel-about.webp"
                alt="Психолог Крістель Кравець — портрет"
                fill
                sizes="(max-width: 900px) 90vw, 40vw"
              />
            </div>
            <div className="photo arch-leaf">
              <Image
                src="/kristel-about-2.webp"
                alt="Крістель Кравець під час психологічної консультації"
                fill
                sizes="(max-width: 900px) 80vw, 35vw"
              />
            </div>
          </div>

          <div>
            <p className="eyebrow">Про мене</p>
            <h2 id="about-title" className={styles.title}>
              Крістель Кравець<span className="dot">.</span>
            </h2>
            <p className={styles.sub}>У сфері психотерапії я вже більше 8 років.</p>

            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className={styles.body}>
                {paragraph}
              </p>
            ))}

            <ul className={styles.creds}>
              {credentials.map((cred) => (
                <li key={cred.strong}>
                  {cred.prefix}
                  <b>{cred.strong}</b>
                  {cred.rest}
                </li>
              ))}
            </ul>

            <div className={styles.feats}>
              {features.map((feature) => (
                <div key={feature.title} className={styles.feat}>
                  <FeatureIcon name={feature.icon} />
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="btns">
              <a href="#contact" className="btn btn-fill">
                Записатися <span className="arw">⟶</span>
              </a>
              <a href="#faq" className="btn btn-line">
                Поширені запитання
              </a>
            </div>
          </div>
        </div>

        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt>{stat.value}</dt>
              <dd>{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
