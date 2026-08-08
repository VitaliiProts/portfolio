import Image from 'next/image';
import { certificates } from '@/lib/content';
import styles from './Certificates.module.css';

export function Certificates() {
  return (
    <section className={styles.certs} id="certs" aria-labelledby="certs-title">
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow">Освіта та підвищення кваліфікації</p>
          <h2 id="certs-title">
            Сертифікати<span className="dot">.</span>
          </h2>
          <p className="lead">
            Документи про навчання з гештальт-терапії, РХП, психіатрії, тривоги та роботи з травмою.
          </p>
        </div>

        <div className={styles.grid}>
          {certificates.map((cert) => (
            <figure key={cert.src} className={styles.cert}>
              <a href={cert.src} target="_blank" rel="noopener noreferrer">
                <Image
                  src={cert.src}
                  alt={cert.alt}
                  fill
                  sizes="(max-width: 900px) 90vw, (max-width: 1100px) 45vw, 30vw"
                />
              </a>
              <figcaption>
                <b>{cert.title}</b>
                {cert.meta}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
