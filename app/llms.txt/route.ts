import { credentials, faq, plans, topics } from '@/lib/content';
import { formatPrice, prices, site } from '@/lib/site';
import { questionsLabel, testPath, tests, testsHubPath } from '@/lib/tests';

/** Файл віддається як статика разом із рештою збірки. */
export const dynamic = 'force-static';

/**
 * llms.txt — стислий зріз сайту звичайним текстом для AI-асистентів.
 * Як і JSON-LD, будується з тих самих даних, що й сторінки: інакше факти
 * в ньому почнуть розходитися з тим, що бачить людина.
 */
function buildLlmsTxt(): string {
  const url = (path: string) => `${site.url}${path === '/' ? '' : path}`;

  const credentialLine = (item: (typeof credentials)[number]) =>
    `${item.prefix ?? ''}${item.strong}${item.rest ?? ''}`;

  return [
    `# ${site.shortName} — ${site.jobTitle.toLowerCase()}`,
    '',
    '> Психологиня та гештальт-терапевтка (у процесі сертифікації) з Києва.',
    '> Спеціалізація — розлади харчової поведінки (анорексія, булімія,',
    '> компульсивне переїдання), тривожні розлади й панічні атаки.',
    '> Працює з дорослими та підлітками, українською мовою, онлайн і очно в Києві.',
    '',
    '## Коротко',
    '',
    `- Спеціаліст: ${site.shortName}, ${site.jobTitle}`,
    '- Підхід: гештальт-терапія, тілесно-орієнтований підхід, психоедукація',
    '- Формат: онлайн (месенджери, відеозв’язок) і очні сесії в центрі Києва',
    '- Тривалість сесії: 50–60 хвилин',
    `- Вартість: індивідуальна сесія і терапія РХП — ${formatPrice(prices.individual)}, ` +
      `парна сесія з батьками — ${formatPrice(prices.teenPair)}`,
    '- Клієнти: дорослі та підлітки',
    '- Мова: українська',
    `- Запис: Telegram ${site.telegramUrl}`,
    '- Оплата за добу до сесії; перенесення безкоштовне, якщо попередити за 24 години',
    '- Конфіденційно, за бажанням — під псевдонімом',
    '',
    '## Кваліфікація',
    '',
    ...credentials.map((item) => `- ${credentialLine(item)}`),
    '',
    '## З чим працює',
    '',
    ...topics.map((topic) => `- ${topic.question}: ${topic.answer}`),
    '',
    '## Ціни',
    '',
    ...plans.map((plan) => `- ${plan.title} — ${formatPrice(plan.price)} ${plan.unit}`),
    '',
    '## Сторінки',
    '',
    `- [Головна](${url('/')}): послуги, кваліфікація, ціни, відгуки та відповіді на часті запитання.`,
    `- [Психологічні тести](${url(
      testsHubPath,
    )}): добірка безкоштовних скринінгових методик із поясненням результату.`,
    '',
    '## Психологічні тести',
    '',
    ...tests.map(
      (test) =>
        `- [${test.title}](${url(testPath(test.slug))}): ${test.summary} ` +
        `${test.source}, ${questionsLabel(test.questions.length)}, ~${test.estimatedMinutes} хв.`,
    ),
    '',
    '## Часті запитання',
    '',
    ...faq.flatMap((item) => [`### ${item.question}`, '', item.answer, '']),
    '## Контакти',
    '',
    `- Telegram (основний канал запису): ${site.telegramUrl}`,
    `- Instagram: ${site.instagramUrl}`,
    '',
    '## Важливо',
    '',
    'Сайт і тести на ньому мають інформаційний характер. Скринінгові методики не',
    'встановлюють діагноз і не замінюють консультацію лікаря чи психотерапевта.',
    'У разі загрози життю звертайтеся по невідкладну допомогу.',
    '',
  ].join('\n');
}

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
