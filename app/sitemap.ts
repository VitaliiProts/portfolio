import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { testPath, tests, testsHubPath } from '@/lib/tests';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: site.url,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${site.url}${testsHubPath}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...tests.map((test) => ({
      url: `${site.url}${testPath(test.slug)}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
