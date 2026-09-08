import { Breadcrumbs, type Crumb } from '@/components/Breadcrumbs';
import { Faq } from '@/components/Faq';
import { Pricing } from '@/components/Pricing';
import { Reviews } from '@/components/Reviews';
import { reviewsByTags } from '@/lib/content';
import { getTopic, type TopicDefinition, topicPath } from '@/lib/topics';
import { TopicBody } from './TopicBody';
import { TopicCta } from './TopicCta';
import { TopicRelated } from './TopicRelated';
import { TopicTests } from './TopicTests';
import { TopicToc } from './TopicToc';
import styles from './TopicPage.module.css';

function trailFor(topic: TopicDefinition): readonly Crumb[] {
  const parent = topic.parent ? getTopic(topic.parent) : undefined;
  const own = { name: topic.h1, path: topicPath(topic.slug) };

  return parent ? [{ name: parent.h1, path: topicPath(parent.slug) }, own] : [own];
}

export function TopicPage({ topic }: { topic: TopicDefinition }) {
  const topicReviews = reviewsByTags(topic.reviewTags);

  return (
    <>
      <article className={styles.page} aria-labelledby="topic-title">
        <div className={`wrap ${styles.inner}`}>
          <Breadcrumbs trail={trailFor(topic)} />

          <h1 id="topic-title" className={styles.title}>
            {topic.h1}
            <span className="dot">.</span>
          </h1>

          <p className={`lead ${styles.lead}`}>{topic.lead}</p>

          <TopicToc sections={topic.sections} />
          <TopicBody sections={topic.sections} />
          <TopicRelated topic={topic} />
          <TopicTests slugs={topic.tests} />
          <TopicCta message={topic.ctaMessage} />
        </div>
      </article>

      {topicReviews.length > 0 && (
        <Reviews items={topicReviews} eyebrow="Досвід клієнтів" heading="Що кажуть клієнти" />
      )}

      <Faq
        items={topic.faq}
        eyebrow="Питання по темі"
        heading="Часті запитання"
        lead="Те, про що найчастіше запитують перед першою сесією."
      />

      {/* Наявний блок цін без змін: його тарифи мають власні ctaSource,
          і підміна посилань зламала б аналітику. Тему доносить TopicCta вище. */}
      <Pricing />
    </>
  );
}
