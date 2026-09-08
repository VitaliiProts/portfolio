import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { testPath, tests, testsHubPath } from '@/lib/tests';
import { topicPath, visibleTopics } from '@/lib/topics';

/** lastModified беремо з даних, а не з дати збірки: інакше кожен деплой виглядає як правка. */
export default function sitemap(): MetadataRoute.Sitemap {
  const topics = visibleTopics();

  // Хаб тестів власного контенту майже не має — він перелічує тести, тож
  // змінюється рівно тоді, коли змінюється найсвіжіший із них. Дати тем сюди не
  // беремо: інакше правка будь-якої теми виглядала б як правка хаба тестів.
  const latestTestDate = tests
    .map((test) => test.updatedAt)
    .sort()
    .at(-1);

  return [
    {
      url: site.url,
      lastModified: new Date(site.updatedAt),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...topics.map((topic) => ({
      url: `${site.url}${topicPath(topic.slug)}`,
      lastModified: new Date(topic.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: topic.parent ? 0.7 : 0.8,
    })),
    {
      url: `${site.url}${testsHubPath}`,
      lastModified: new Date(latestTestDate ?? site.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...tests.map((test) => ({
      url: `${site.url}${testPath(test.slug)}`,
      lastModified: new Date(test.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
