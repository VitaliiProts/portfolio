import { articlePath, articlesHubPath, type ArticleDefinition, visibleArticles } from './articles';
import { faq, plans } from './content';
import { prices, site } from './site';
import { tests, testPath, testsHubPath } from './tests';
import type { TestDefinition } from './tests/types';
import { getTopic, topicPath } from './topics';
import type { TopicDefinition } from './topics/types';

/**
 * JSON-LD будується з тих самих даних, що й розмітка сторінки,
 * тому структуровані дані не розходяться з контентом.
 */
export function buildJsonLd() {
  const personId = `${site.url}/#kristel`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: site.shortName,
        jobTitle: site.jobTitle,
        description:
          'Психолог, гештальт-терапевт у процесі сертифікації, фахівець з РХП. Працює з дорослими та підлітками онлайн і в Києві.',
        image: `${site.url}${site.ogImage}`,
        url: site.url,
        sameAs: [site.instagramUrl, site.telegramUrl],
        knowsAbout: [
          'Розлади харчової поведінки',
          'Анорексія',
          'Булімія',
          'Компульсивне переїдання',
          'Тривожні розлади',
          'Панічні атаки',
          'Гештальт-терапія',
        ],
        alumniOf: [
          {
            '@type': 'CollegeOrUniversity',
            name: 'Київський національний університет імені Тараса Шевченка',
          },
          { '@type': 'EducationalOrganization', name: 'Київський Гештальт Університет' },
        ],
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${site.url}/#practice`,
        name: `${site.shortName} — психологічна практика`,
        provider: { '@id': personId },
        areaServed: ['UA', 'Київ'],
        availableLanguage: ['uk'],
        serviceType: [
          'Психотерапія',
          'Терапія розладів харчової поведінки',
          'Онлайн-консультації',
          'Підліткова терапія',
        ],
        priceRange: `₴${prices.individual}-₴${prices.teenPair}`,
        url: site.url,
        image: `${site.url}${site.ogImage}`,
        description:
          'Індивідуальна та підліткова психотерапія з фокусом на РХП, тривозі та панічних атаках. Сесії онлайн і офлайн у Києві.',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Сесії психолога',
          itemListElement: plans.map((plan) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: plan.title },
            price: String(plan.price),
            priceCurrency: 'UAH',
            availability: 'https://schema.org/InStock',
          })),
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${site.url}/#faq`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

const author = { '@type': 'Person', name: site.shortName, url: site.url } as const;

function breadcrumbs(trail: readonly { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Головна', path: '/' }, ...trail].map((item, position) => ({
      '@type': 'ListItem',
      position: position + 1,
      name: item.name,
      item: `${site.url}${item.path === '/' ? '' : item.path}`,
    })),
  };
}

export function buildTestsHubJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${site.url}${testsHubPath}#page`,
        url: `${site.url}${testsHubPath}`,
        name: 'Психологічні тести онлайн',
        description:
          'Безкоштовні скринінгові тести на тривожність, депресію, ОКР, розлади харчової поведінки та тип привʼязаності.',
        inLanguage: site.lang,
        author,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: tests.map((test, position) => ({
            '@type': 'ListItem',
            position: position + 1,
            name: test.title,
            url: `${site.url}${testPath(test.slug)}`,
          })),
        },
      },
      breadcrumbs([{ name: 'Тести', path: testsHubPath }]),
    ],
  };
}

export function buildTestJsonLd(test: TestDefinition) {
  const url = `${site.url}${testPath(test.slug)}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#page`,
        url,
        name: test.title,
        description: test.metaDescription,
        inLanguage: site.lang,
        author,
        about: test.source,
      },
      breadcrumbs([
        { name: 'Тести', path: testsHubPath },
        { name: test.title, path: testPath(test.slug) },
      ]),
    ],
  };
}

/**
 * MedicalWebPage навмисно не використовуємо: вона передбачає reviewedBy й
 * lastReviewed від медичного рецензента, якого в практики немає.
 */
export function buildTopicJsonLd(topic: TopicDefinition) {
  const url = `${site.url}${topicPath(topic.slug)}`;
  const parent = topic.parent ? getTopic(topic.parent) : undefined;

  const trail = parent
    ? [
        { name: parent.h1, path: topicPath(parent.slug) },
        { name: topic.h1, path: topicPath(topic.slug) },
      ]
    : [{ name: topic.h1, path: topicPath(topic.slug) }];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#page`,
        url,
        name: topic.h1,
        description: topic.description,
        inLanguage: site.lang,
        // updatedAt зберігається як YYYY-MM-DD — валідний ISO 8601 для schema.org.
        dateModified: topic.updatedAt,
        author,
        about: { '@type': 'MedicalCondition', name: topic.h1 },
      },
      breadcrumbs(trail),
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: topic.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

/**
 * У статей author і publisher посилаються на той самий @id, що й Person на
 * головній: без цього мовна модель бачить імʼя автора як рядок і не повʼязує
 * текст із фахівчинею, чию кваліфікацію описує головна сторінка.
 *
 * Теми й тести поки використовують author без @id — коли їх переведуть на
 * посилання, ці дві функції можна буде перевикористати й там.
 */
const kristelRef = { '@id': `${site.url}/#kristel` } as const;

/**
 * Саме посилання @id у графі не розвʼязується: повний Person лежить на
 * головній, і сподіватися, що парсер сходить туди сам, не можна. Тому в граф
 * кожної статті кладемо стислу картку тієї самої сутності — той самий @id,
 * імʼя, посада й sameAs. Для парсера це один вузол, описаний двічі, а не два
 * різні автори; докладні дані (освіта, knowsAbout) лишаються на головній.
 */
function kristelNode() {
  return {
    '@type': 'Person',
    '@id': `${site.url}/#kristel`,
    name: site.shortName,
    jobTitle: site.jobTitle,
    url: site.url,
    image: `${site.url}${site.ogImage}`,
    sameAs: [site.instagramUrl, site.telegramUrl],
  };
}

export function buildArticlesHubJsonLd() {
  const articles = visibleArticles();

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${site.url}${articlesHubPath}#page`,
        url: `${site.url}${articlesHubPath}`,
        name: 'Статті психолога',
        description:
          'Статті про розлади харчової поведінки, тривожність, привʼязаність і гештальт-терапію від психолога Крістель Кравець.',
        inLanguage: site.lang,
        author: kristelRef,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: articles.map((article, position) => ({
            '@type': 'ListItem',
            position: position + 1,
            name: article.h1,
            url: `${site.url}${articlePath(article.slug)}`,
          })),
        },
      },
      breadcrumbs([{ name: 'Статті', path: articlesHubPath }]),
      kristelNode(),
    ],
  };
}

export function buildArticleJsonLd(article: ArticleDefinition) {
  const url = `${site.url}${articlePath(article.slug)}`;
  const about = article.topics
    .map((slug) => getTopic(slug))
    .filter((topic) => topic !== undefined)
    .map((topic) => ({ '@type': 'Thing', name: topic.h1 }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: article.h1,
        description: article.description,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${url}#page` },
        // Дати зберігаються як YYYY-MM-DD — валідний ISO 8601 для schema.org.
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        inLanguage: site.lang,
        author: kristelRef,
        publisher: kristelRef,
        image: `${site.url}${site.ogImage}`,
        // Порожній about — сміття в розмітці, тому поле зʼявляється лише тоді,
        // коли стаття справді привʼязана до видимих тем.
        ...(about.length > 0 ? { about } : {}),
      },
      breadcrumbs([
        { name: 'Статті', path: articlesHubPath },
        { name: article.h1, path: articlePath(article.slug) },
      ]),
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: article.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
      kristelNode(),
    ],
  };
}
