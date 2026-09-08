import { Breadcrumbs, type Crumb } from '@/components/Breadcrumbs';
import { getTopic, type TopicDefinition, topicPath } from '@/lib/topics';
import { TopicBody } from './TopicBody';
import { TopicToc } from './TopicToc';
import styles from './TopicPage.module.css';

function trailFor(topic: TopicDefinition): readonly Crumb[] {
  const parent = topic.parent ? getTopic(topic.parent) : undefined;
  const own = { name: topic.h1, path: topicPath(topic.slug) };

  return parent ? [{ name: parent.h1, path: topicPath(parent.slug) }, own] : [own];
}

export function TopicPage({ topic }: { topic: TopicDefinition }) {
  return (
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
      </div>
    </article>
  );
}
