import type { TopicSection } from '@/lib/topics';
import styles from './TopicPage.module.css';

export function TopicBody({ sections }: { sections: readonly TopicSection[] }) {
  return (
    <div className={styles.body}>
      {sections.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
          <h2 id={`${section.id}-title`}>{section.heading}</h2>

          {/* Індекс як key допустимий: блоки статичні й не переставляються. */}
          {section.blocks.map((block, index) => {
            if (block.type === 'list') {
              return (
                <ul key={index}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }

            if (block.type === 'callout') {
              return (
                <aside
                  key={index}
                  className={block.tone === 'safety' ? styles.safety : styles.note}
                  role={block.tone === 'safety' ? 'note' : undefined}
                >
                  {block.text}
                </aside>
              );
            }

            return <p key={index}>{block.text}</p>;
          })}
        </section>
      ))}
    </div>
  );
}
