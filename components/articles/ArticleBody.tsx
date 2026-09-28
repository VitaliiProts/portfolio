import type { ArticleSection } from '@/lib/articles';
import shared from '@/components/topics/TopicPage.module.css';
import { RichText } from './RichText';

export function ArticleBody({ sections }: { sections: readonly ArticleSection[] }) {
  return (
    <div className={shared.body}>
      {sections.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
          <h2 id={`${section.id}-title`}>{section.heading}</h2>

          {/* Індекс як key допустимий: блоки статичні й не переставляються. */}
          {section.blocks.map((block, index) => {
            if (block.type === 'list') {
              return (
                <ul key={index}>
                  {block.items.map((item) => (
                    <li key={item}>
                      <RichText text={item} />
                    </li>
                  ))}
                </ul>
              );
            }

            if (block.type === 'callout') {
              return (
                <aside
                  key={index}
                  className={block.tone === 'safety' ? shared.safety : shared.note}
                  role={block.tone === 'safety' ? 'note' : undefined}
                >
                  <RichText text={block.text} />
                </aside>
              );
            }

            return (
              <p key={index}>
                <RichText text={block.text} />
              </p>
            );
          })}
        </section>
      ))}
    </div>
  );
}
