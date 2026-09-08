import Image from 'next/image';
import Link from 'next/link';
import { topics } from '@/lib/content';
import { getTopic, topicPath, topics as topicRegistry } from '@/lib/topics';
import styles from './Topics.module.css';

/** Пункт акордеону → сторінка теми. Пункти без сторінки лишаються текстом. */
const TOPIC_SLUGS: Record<string, string | undefined> = {
  'РХП — розлади харчової поведінки': 'eating-disorders',
  'Тривога та тривожні розлади': 'anxiety-and-panic-attacks',
};

/*
 * Ключ мапи має дослівно збігатися з question у lib/content.ts, а значення —
 * зі slug у реєстрі тем. Розбіжність мовчки перетворила б картку на текст без
 * посилання, тому хибний запис валить збірку, а не чекає, поки його помітять.
 * Звіряємо з повним реєстром, а не з visibleTopics(): чернетка на проді — не
 * помилка мапи, її ховає getTopic().
 */
for (const [question, slug] of Object.entries(TOPIC_SLUGS)) {
  if (!topics.some((item) => item.question === question)) {
    throw new Error(`Topics: ключа «${question}» немає серед пунктів topics у lib/content.ts`);
  }
  if (!topicRegistry.some((topic) => topic.slug === slug)) {
    throw new Error(`Topics: slug «${slug}» відсутній у реєстрі lib/topics`);
  }
}

export function Topics() {
  return (
    <section className={styles.reach} id="topics" aria-labelledby="topics-title">
      <div className="blob blob-b" aria-hidden="true" />

      <div className={`wrap ${styles.inner}`}>
        <div>
          <p className="eyebrow">Коли варто прийти</p>
          {/* Пробіл перед <br> — інакше в екстрагованому тексті «можудопомогти». */}
          <h2 id="topics-title">
            З чим я можу{' '}
            <br />
            допомогти<span className="dot">.</span>
          </h2>
          <p className={`lead ${styles.lead}`}>
            Не обов&#8217;язково чекати, поки стане нестерпно. Ось із чим найчастіше звертаються.
          </p>

          <ul className={styles.topics}>
            {topics.map((item) => {
              const slug = TOPIC_SLUGS[item.question];
              const topic = slug ? getTopic(slug) : undefined;

              return (
                <li key={item.question}>
                  {topic ? (
                    <Link href={topicPath(topic.slug)} className={styles.topicLink}>
                      {topic.h1}
                    </Link>
                  ) : (
                    <span className={styles.topicName}>{item.question}</span>
                  )}
                  <p>{item.answer}</p>
                </li>
              );
            })}
          </ul>

          <div className={`btns ${styles.actions}`}>
            <a href="#contact" className="btn btn-fill">
              Написати мені <span className="arw">&#x27F6;</span>
            </a>
          </div>
        </div>

        <div className="photo arch-leaf cert-frame">
          <Image
            src="/kristel-sertifikat7.webp"
            alt="Сертифікат — гештальт-підхід у роботі з панічними атаками"
            fill
            sizes="(max-width: 900px) 90vw, 45vw"
          />
        </div>
      </div>
    </section>
  );
}
