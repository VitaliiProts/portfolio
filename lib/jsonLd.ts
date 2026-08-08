import { faq, plans } from './content';
import { prices, site } from './site';

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
