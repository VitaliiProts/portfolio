import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { TopicPage } from '@/components/topics/TopicPage';
import { buildTopicJsonLd } from '@/lib/jsonLd';
import { getTopic, topicPath, visibleTopics } from '@/lib/topics';

type Props = { params: Promise<{ slug: string }> };

/** Невідомий slug має падати в 404 на збірці, а не рендеритись у рантаймі. */
export const dynamicParams = false;

export function generateStaticParams() {
  return visibleTopics().map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};

  return {
    title: topic.title,
    description: topic.description,
    alternates: { canonical: topicPath(topic.slug) },
    openGraph: {
      type: 'article',
      url: topicPath(topic.slug),
      title: topic.title,
      description: topic.description,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  return (
    <>
      <JsonLd data={buildTopicJsonLd(topic)} />
      <TopicPage topic={topic} />
    </>
  );
}
