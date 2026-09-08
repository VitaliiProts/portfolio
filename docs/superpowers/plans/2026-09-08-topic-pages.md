# Тематичні сторінки — план впровадження

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Підняти шість тематичних сторінок (хаб РХП, анорексія, булімія, переїдання, тривога й панічні атаки, підлітки), кожна з яких відповідає на один намір пошуку і живиться з єдиного реєстру.

**Architecture:** Реєстр `lib/topics/*` за зразком `lib/tests/*` — по одному TS-файлу на тему плюс `index.ts` з вибірками. Один динамічний маршрут `app/[slug]/page.tsx` збирає сторінку спільним компонентом `TopicPage`. Реєстр читають шість споживачів: маршрут, sitemap, JSON-LD, `llms.txt`, картки на головній, футер. Інваріанти контенту стереже `scripts/check-topics.ts`.

**Tech Stack:** Next.js 16 App Router (SSG), React 19, TypeScript 6, CSS Modules, `tsx` для скриптів. Нових залежностей не додаємо.

## Global Constraints

- Мова коду й коментарів — українська; коментар пояснює обмеження, а не переказує код.
- Нових npm-залежностей не додавати. Тестового фреймворку в проєкті немає: перевірки — скрипти на `tsx`.
- Стилі — тільки CSS Modules поряд із компонентом; глобальні класи (`wrap`, `btn`, `btn-fill`, `btn-line`, `lead`, `eyebrow`, `dot`, `acc`, `stars`, `arw`) переюзуємо, нових глобальних не заводимо.
- Канонічний хост `www.psykristel.com`, `site.url` — єдине джерело абсолютних адрес. Хардкоду домену в коді бути не може.
- Жоден наявний URL не видаляється, не перейменовується і не редиректиться.
- Головна сторінка після всіх задач виглядає так само, як зараз, за єдиним винятком: секція «З чим я можу допомогти» стає картками з посиланнями (Task 9).
- Slug теми не може збігатися з `sectionIds` у `next.config.ts` (`about`, `certs`, `services`, `topics`, `faq`, `reviews`, `pricing`, `contact`, `privacy`) і зі статичним сегментом `tests`.
- Вимоги до опублікованої сторінки — з розділу «Контент» спеки: ≥ 800 слів (хаб ≥ 1000), обов'язкові секції в порядку `symptoms → when-to-seek-help → therapy → format → today`, 3–5 унікальних FAQ, `title` ≤ 60, `description` ≤ 155, `h1 !== title`, callout безпеки там, де `requiresSafetyNote`.
- Після кожної задачі мають бути чисті `npm run lint`, `npm run typecheck`, `npm run build`, `npm run check:topics`.
- Комітимо часто: один коміт на задачу, повідомлення українською в наявному стилі (`feat:`, `fix:`, `refactor:`, `content:`).

## Уточнення до спеки, зафіксовані тут

Ці три пункти виявилися при читанні коду вже після затвердження спеки. План виконується за цією редакцією; спеку оновлює Task 12.

1. **Показ чернеток.** Замість ручного перемикання `published` для превʼю: `visibleTopics()` віддає всі теми, коли `VERCEL_ENV !== 'production'`, і лише опубліковані в проді. Превʼю-деплої й так віддають `X-Robots-Tag: noindex` (див. `next.config.ts`), тож чернетка не потрапить в індекс, а локальна розробка не потребує правок прапорця.
2. **Колонка у футері вже є.** `footerTopics` у `lib/content.ts:445` існує і веде на `/services` та `/topics`. Task 9 не створює колонку, а перенаправляє її пункти на реальні сторінки.
3. **Поріг відгуків.** Тегів «Анорексія», «Булімія», «Переїдання» — по одному відгуку на кожен. Правило стає таким: сторінка з `parent` вимагає ≥ 1 збігу, хаб і сторінки без `parent` — ≥ 2. Блок відгуків рендериться за наявності хоча б одного збігу.

Рішення користувача від 2026-09-08: оцінки «5/5» у відгуках **лишаються**; поле `rating` у моделі присутнє. Рядок дорожньої карти про їх видалення закривається як відхилений (Task 12).

---

## Task 0: Гілка і фіксація документів

**Files:**
- Modify: none
- Commit: `docs/superpowers/specs/2026-09-07-topic-pages-design.md`, `docs/seo-growth-roadmap.md`

- [ ] **Step 1: Створити гілку**

```bash
cd /Users/vitalii/Documents/home/portfolio
git switch -c feat/topic-pages
```

- [ ] **Step 2: Переконатися, що робоче дерево містить лише документи**

Run: `git status --short`
Expected: рівно три недоданих шляхи — `docs/seo-growth-roadmap.md`, `docs/superpowers/plans/`, `docs/superpowers/specs/2026-09-07-topic-pages-design.md` (плюс `2026-08-24-telegram-bot-design.md`, який лежить незакоміченим з попередньої роботи).

- [ ] **Step 3: Коміт документів**

```bash
git add docs/
git commit -m "docs: спека й дорожня карта тематичних сторінок"
```

---

## Task 1: Теги відгуків

Фільтрувати відгуки по темі зараз неможливо: `Review.topic` — це склеєний рядок `'Булінг · вага · оцінка 5/5'`. Розділяємо на теги й оцінку, зберігаючи вигляд головної байт у байт.

**Files:**
- Modify: `lib/content.ts:275-362` (тип `Review` і масив `reviews`)
- Modify: `components/Reviews.tsx:1-62`

**Interfaces:**
- Produces: `ReviewTag` (union), `Review = { quote, author, tags: readonly ReviewTag[], rating: number }`, `reviewsByTags(tags: readonly ReviewTag[]): readonly Review[]`, `<Reviews items?, heading?, eyebrow? />`

- [ ] **Step 1: Замінити тип `Review` і додати словник тегів**

У `lib/content.ts` замість рядка 275:

```ts
/**
 * Теги водночас служать ключем фільтра на тематичних сторінках і підписом під
 * відгуком, тому записані так, як мають виглядати на екрані.
 */
export type ReviewTag =
  | 'РХП'
  | 'Анорексія'
  | 'Булімія'
  | 'Переїдання'
  | 'Тривога'
  | 'Тривожні стани'
  | 'Панічні атаки'
  | 'Підліткова криза'
  | 'Батьки й підлітки'
  | 'Самооцінка'
  | 'Неприйняття себе'
  | 'Депресія'
  | 'МРО'
  | 'Булінг'
  | 'вага';

export type Review = {
  quote: string;
  author: string;
  tags: readonly ReviewTag[];
  rating: number;
};
```

- [ ] **Step 2: Перерозмітити всі 14 відгуків**

У кожному елементі `reviews` замінити `topic: '<теми> · оцінка 5/5'` на `tags` і `rating`. Повний мапінг (порядок тегів = порядок у нинішньому рядку, щоб підпис не змінився):

| Автор | Було `topic` | Стає |
| --- | --- | --- |
| Анонімно (їжа, провина) | `РХП · оцінка 5/5` | `tags: ['РХП'], rating: 5` |
| Сергій | `Булінг · вага · оцінка 5/5` | `tags: ['Булінг', 'вага'], rating: 5` |
| Олена | `Тривога · оцінка 5/5` | `tags: ['Тривога'], rating: 5` |
| Марія | `Панічні атаки · оцінка 5/5` | `tags: ['Панічні атаки'], rating: 5` |
| Анонімно (анорексія) | `Анорексія · оцінка 5/5` | `tags: ['Анорексія'], rating: 5` |
| Ірина | `Булімія · оцінка 5/5` | `tags: ['Булімія'], rating: 5` |
| Катерина | `Переїдання · оцінка 5/5` | `tags: ['Переїдання'], rating: 5` |
| Анна | `Самооцінка · оцінка 5/5` | `tags: ['Самооцінка'], rating: 5` |
| Андрій | `Депресія · оцінка 5/5` | `tags: ['Депресія'], rating: 5` |
| Анонімно (МРО) | `МРО · оцінка 5/5` | `tags: ['МРО'], rating: 5` |
| Юлія | `Неприйняття себе · оцінка 5/5` | `tags: ['Неприйняття себе'], rating: 5` |
| Софія, 16 | `Підліткова криза · оцінка 5/5` | `tags: ['Підліткова криза'], rating: 5` |
| Наталія | `Батьки й підлітки · оцінка 5/5` | `tags: ['Батьки й підлітки'], rating: 5` |
| Вікторія | `Тривожні стани · оцінка 5/5` | `tags: ['Тривожні стани'], rating: 5` |

Кожен тег дослівно дорівнює тому, що вже надруковано під відгуком, тому підписи на головній не змінюються жодним символом. Хаб РХП набирає свої чотири відгуки не додатковим тегом у даних, а переліком усіх чотирьох тегів у власному `reviewTags` (Task 3).

- [ ] **Step 3: Додати вибірку за тегами**

Наприкінці блоку відгуків у `lib/content.ts`:

```ts
/** Відгуки, що мають хоча б один зі вказаних тегів. Порядок — як у масиві. */
export function reviewsByTags(tags: readonly ReviewTag[]): readonly Review[] {
  if (tags.length === 0) return [];
  return reviews.filter((review) => review.tags.some((tag) => tags.includes(tag)));
}
```

- [ ] **Step 4: Оновити `components/Reviews.tsx`**

```tsx
'use client';

import { reviews as allReviews, type Review } from '@/lib/content';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { useCarousel } from './useCarousel';
import styles from './Reviews.module.css';

export function Reviews({
  items = allReviews,
  eyebrow = 'Відгуки клієнтів',
  heading = 'Що кажуть клієнти',
}: {
  items?: readonly Review[];
  eyebrow?: string;
  heading?: string;
} = {}) {
  const { railRef, scrollPrev, scrollNext, atStart, atEnd } = useCarousel<HTMLDivElement>(
    `.${styles.rev}`,
  );

  return (
    <section className={styles.reviews} id="reviews" aria-labelledby="reviews-title">
      <div className="wrap">
        <div className={styles.head}>
          <div>
            <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
            <h2 id="reviews-title" className={styles.title}>
              {heading}
              <span className="dot">.</span>
            </h2>
          </div>
          <div className={styles.nav}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={scrollPrev}
              disabled={atStart}
              aria-label="Попередні відгуки"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={scrollNext}
              disabled={atEnd}
              aria-label="Наступні відгуки"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        <div
          className={styles.rail}
          ref={railRef}
          tabIndex={0}
          role="group"
          aria-label="Відгуки клієнтів"
        >
          {items.map((review) => (
            <article key={review.quote.slice(0, 40)} className={styles.rev}>
              <span className="stars" aria-hidden="true">
                ★★★★★
              </span>
              <p>{review.quote}</p>
              <div className={styles.who}>
                {review.author}
                {/* Один рядок, а не кілька виразів: інакше React розбиває підпис
                    на текстові вузли з коментарями-роздільниками в HTML. */}
                <small>{`${review.tags.join(' · ')} · оцінка ${review.rating}/5`}</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Перевірити, що головна не змінилася**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: без помилок. Далі:

```bash
PORT=3111 npm run start &
sleep 5
curl -s localhost:3111 | grep -c 'Анорексія · оцінка 5/5'
curl -s localhost:3111 | grep -c 'Булінг · вага · оцінка 5/5'
curl -s localhost:3111 | grep -c 'Тривога · оцінка 5/5'
kill %1
```

Expected: тричі `1`. Підписи мають збігатися з нинішніми дослівно; порт нестандартний, бо 3000 часто зайнятий іншим застосунком.

- [ ] **Step 6: Коміт**

```bash
git add lib/content.ts components/Reviews.tsx
git commit -m "refactor: теги й оцінка окремими полями у відгуках"
```

---

## Task 2: Реєстр тем і скрипт перевірки

Каркас без жодної теми: типи, порожній реєстр, скрипт інваріантів. Наступні задачі наповнюють його.

**Files:**
- Create: `lib/topics/types.ts`
- Create: `lib/topics/index.ts`
- Create: `scripts/check-topics.ts`
- Modify: `package.json:9-16` (скрипти)

**Interfaces:**
- Consumes: `ReviewTag` з Task 1.
- Produces: `TopicDefinition`, `TopicSection`, `TopicBlock`, `REQUIRED_SECTION_IDS`, `topics`, `visibleTopics()`, `getTopic(slug)`, `topicPath(slug)`, `childrenOf(slug)`, `siblingsOf(topic: TopicDefinition)`.

- [ ] **Step 1: Створити `lib/topics/types.ts`**

Імпорт відносний, а не через `@/`: файли в `lib/` посилаються одне на одного відносними шляхами, і саме так їх бачить `tsx` під час запуску скриптів.

```ts
import type { Accordion, ReviewTag } from '../content';

export type TopicBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: readonly string[] }
  | { type: 'callout'; tone: 'info' | 'safety'; text: string };

export type TopicSection = {
  /** Якір і ключ порядку. Латиницею, бо потрапляє в URL. */
  id: string;
  heading: string;
  blocks: readonly TopicBlock[];
};

export type TopicDefinition = {
  slug: string;
  /** <title>, ≤ 60 знаків. */
  title: string;
  /** meta description, ≤ 155 знаків. */
  description: string;
  /** <h1>, не дорівнює title дослівно. */
  h1: string;
  /** Абзац під H1 — пряма відповідь на пошуковий запит. */
  lead: string;
  published: boolean;
  /** ISO-дата останньої змістовної правки. Проставляється руками. */
  updatedAt: string;
  /** Slug хаба для дочірніх сторінок РХП. */
  parent?: string;
  requiresSafetyNote: boolean;
  sections: readonly TopicSection[];
  faq: readonly Accordion[];
  reviewTags: readonly ReviewTag[];
  /** Slug-и з lib/tests. */
  tests: readonly string[];
  /** Текст повідомлення для telegramLink(). */
  ctaMessage: string;
};

/** Обов'язковий кістяк сторінки в порядку показу. */
export const REQUIRED_SECTION_IDS = [
  'symptoms',
  'when-to-seek-help',
  'therapy',
  'format',
  'today',
] as const;
```

- [ ] **Step 2: Створити `lib/topics/index.ts` з порожнім реєстром**

```ts
import type { TopicDefinition } from './types';

/** Порядок визначає видачу в футері, sitemap і llms.txt. */
export const topics: readonly TopicDefinition[] = [];

/**
 * Чернетки ховаємо лише на проді. Порівнюємо з 'production' напряму, без
 * підстановки за замовчуванням: коли VERCEL_ENV не заданий — тобто локально —
 * теми мають бути видні, інакше сторінку неможливо відкрити до публікації.
 * На превʼю-деплоях чернетки теж видно, але весь превʼю віддає
 * X-Robots-Tag: noindex (див. next.config.ts), тож в індекс вони не потраплять.
 */
export function visibleTopics(): readonly TopicDefinition[] {
  const isProduction = process.env.VERCEL_ENV === 'production';
  return isProduction ? topics.filter((topic) => topic.published) : topics;
}

export function getTopic(slug: string): TopicDefinition | undefined {
  return visibleTopics().find((topic) => topic.slug === slug);
}

export function topicPath(slug: string): string {
  return `/${slug}`;
}

/** Дочірні теми хаба, у порядку реєстру. */
export function childrenOf(slug: string): readonly TopicDefinition[] {
  return visibleTopics().filter((topic) => topic.parent === slug);
}

/** Сестринські теми: спільний батько, крім самої сторінки. */
export function siblingsOf(topic: TopicDefinition): readonly TopicDefinition[] {
  if (!topic.parent) return [];
  return childrenOf(topic.parent).filter((item) => item.slug !== topic.slug);
}

export type { TopicBlock, TopicDefinition, TopicSection } from './types';
export { REQUIRED_SECTION_IDS } from './types';
```

- [ ] **Step 3: Створити `scripts/check-topics.ts`**

```ts
/**
 * Інваріанти реєстру тем. Частина перевірок працює лише для published: true —
 * інакше чернетка блокувала б збірку ще до того, як текст дописано.
 * Запуск: npm run check:topics
 */
import { faq as siteFaq, reviewsByTags } from '../lib/content';
import { testSlugs } from '../lib/tests';
import { REQUIRED_SECTION_IDS, topics } from '../lib/topics';
import type { TopicDefinition } from '../lib/topics/types';

/** Збігається з sectionIds у next.config.ts: ці шляхи зайняті rewrite-ами. */
const RESERVED_SLUGS = [
  'about',
  'certs',
  'services',
  'topics',
  'faq',
  'reviews',
  'pricing',
  'contact',
  'privacy',
  'tests',
];

// Збіг slug теми зі slug тесту не забороняємо: `/binge-eating` і
// `/tests/binge-eating` — різні шляхи, колізії маршрутів не виникає.

/** Без початкових, кінцевих і подвоєних дефісів — те саме правило для slug і для id секцій. */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

let failures = 0;

function fail(message: string): void {
  failures += 1;
  console.log(`FAIL ${message}`);
}

function expect(condition: boolean, message: string): void {
  if (condition) return;
  fail(message);
}

/** U+02BC належить до \p{L}, тож апостроф прибираємо окремо: у текстах трапляються обидва накреслення. */
function normalize(question: string): string {
  return question
    .toLowerCase()
    .replace(/[\u02BC]/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function wordCount(topic: TopicDefinition): number {
  const texts = [topic.lead];

  for (const section of topic.sections) {
    for (const block of section.blocks) {
      if (block.type === 'list') texts.push(...block.items);
      else texts.push(block.text);
    }
  }

  // Тире й лапки окремими токенами не рахуємо: інакше поріг обсягу занижується.
  return texts
    .join(' ')
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

console.log('--- структура ---');

const seenSlugs = new Set<string>();
const seenQuestions = new Map<string, string>();

for (const item of siteFaq) {
  seenQuestions.set(normalize(item.question), 'головна');
}

for (const topic of topics) {
  const at = `${topic.slug}`;

  expect(!seenSlugs.has(topic.slug), `${at}: slug дублюється`);
  seenSlugs.add(topic.slug);

  expect(!RESERVED_SLUGS.includes(topic.slug), `${at}: slug зайнятий rewrite-ом або маршрутом`);
  expect(SLUG_PATTERN.test(topic.slug), `${at}: slug має бути латиницею через дефіс`);
  expect(
    /^\d{4}-\d{2}-\d{2}$/.test(topic.updatedAt) && !Number.isNaN(Date.parse(topic.updatedAt)),
    `${at}: updatedAt має бути коректною ISO-датою`,
  );

  if (topic.parent) {
    const parent = topics.find((candidate) => candidate.slug === topic.parent);

    expect(parent !== undefined, `${at}: parent «${topic.parent}» не існує`);
    expect(topic.parent !== topic.slug, `${at}: тема не може бути власним батьком`);
    // Ієрархія рівно на один рівень: хаб і його діти, без онуків.
    expect(
      parent?.parent === undefined,
      `${at}: parent «${topic.parent}» сам має батька — глибша вкладеність не підтримується`,
    );
  }

  for (const slug of topic.tests) {
    expect(testSlugs.includes(slug), `${at}: тест «${slug}» не існує`);
  }

  const sectionIds = topic.sections.map((section) => section.id);
  const requiredIds: readonly string[] = REQUIRED_SECTION_IDS;
  const required = sectionIds.filter((id) => requiredIds.includes(id));
  expect(
    required.join(',') === REQUIRED_SECTION_IDS.join(','),
    `${at}: обов'язкові секції відсутні або в іншому порядку (маємо ${required.join(',') || '—'})`,
  );

  expect(new Set(sectionIds).size === sectionIds.length, `${at}: id секцій дублюються`);

  for (const section of topic.sections) {
    expect(section.blocks.length > 0, `${at}/${section.id}: порожня секція`);
    expect(SLUG_PATTERN.test(section.id), `${at}/${section.id}: id секції має бути латиницею`);
  }
}

console.log('--- опубліковані сторінки ---');

for (const topic of topics.filter((item) => item.published)) {
  const at = `${topic.slug}`;
  // Хаб оглядає кілька розладів одразу, тому вимога до обсягу вища.
  const isHub = topics.some((candidate) => candidate.parent === topic.slug);
  const minimum = isHub ? 1000 : 800;
  const words = wordCount(topic);

  expect(words >= minimum, `${at}: ${words} слів, потрібно ≥ ${minimum}`);
  expect(topic.title.length <= 60, `${at}: title ${topic.title.length} знаків, максимум 60`);
  expect(
    topic.description.length <= 155,
    `${at}: description ${topic.description.length} знаків, максимум 155`,
  );
  expect(topic.h1 !== topic.title, `${at}: h1 дослівно дорівнює title`);

  expect(
    topic.faq.length >= 3 && topic.faq.length <= 5,
    `${at}: ${topic.faq.length} FAQ, потрібно 3–5`,
  );

  for (const item of topic.faq) {
    const key = normalize(item.question);
    const owner = seenQuestions.get(key);
    expect(owner === undefined, `${at}: питання «${item.question}» вже є (${owner})`);
    seenQuestions.set(key, at);
  }

  if (topic.parent) {
    const parent = topics.find((candidate) => candidate.slug === topic.parent);
    // Інакше на проді крихта опублікованої дитини вела б у 404.
    expect(
      parent?.published === true,
      `${at}: батьківська тема «${topic.parent}» не опублікована`,
    );
  }

  const matched = reviewsByTags(topic.reviewTags).length;
  const minimumReviews = topic.parent ? 1 : 2;
  expect(
    matched >= minimumReviews,
    `${at}: ${matched} відгуків за тегами, потрібно ≥ ${minimumReviews}`,
  );

  if (topic.requiresSafetyNote) {
    const hasSafety = topic.sections.some((section) =>
      section.blocks.some((block) => block.type === 'callout' && block.tone === 'safety'),
    );
    expect(hasSafety, `${at}: відсутній callout безпеки`);
  }

  console.log(`ok   ${at}: ${words} слів, ${topic.faq.length} FAQ, ${matched} відгуків`);
}

console.log(
  failures === 0
    ? `\nУсі перевірки пройдено (тем у реєстрі: ${topics.length}).`
    : `\nПомилок: ${failures}`,
);
process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 4: Додати скрипт у `package.json`**

У блоці `"scripts"` після `"check:tests"`:

```json
    "check:tests": "tsx scripts/check-tests.ts",
    "check:topics": "tsx scripts/check-topics.ts"
```

- [ ] **Step 5: Запустити перевірку на порожньому реєстрі**

Run: `npm run check:topics`
Expected: `Усі перевірки пройдено (тем у реєстрі: 0).`, код виходу 0.

- [ ] **Step 6: Перевірити типи**

Run: `npm run typecheck && npm run lint`
Expected: без помилок.

- [ ] **Step 7: Коміт**

```bash
git add lib/topics scripts/check-topics.ts package.json
git commit -m "feat: реєстр тематичних сторінок і перевірка інваріантів"
```

---

## Task 3: Хаб РХП — перша тема

Перша реальна тема. Вона перевіряє, що інваріанти зі скрипта здійсненні, і дає дані для маршруту в Task 4. Публікується `published: false` — у проді її ще немає, локально й на превʼю видно.

**Files:**
- Create: `lib/topics/eating-disorders.ts`
- Modify: `lib/topics/index.ts` (масив `topics`)

**Interfaces:**
- Consumes: `TopicDefinition` з Task 2.
- Produces: тема зі `slug: 'eating-disorders'`, на яку в Task 10 посилаються троє дітей.

- [ ] **Step 1: Створити файл теми**

Каркас із зафіксованими метаданими — вони SEO-визначальні, тому задані тут дослівно. Поля `lead`, `blocks` і `faq` лишаються порожніми навмисно: їх наповнюють Step 2 і Step 3.

```ts
import type { TopicDefinition } from './types';

export const eatingDisorders: TopicDefinition = {
  slug: 'eating-disorders',
  title: 'Терапія розладів харчової поведінки — психолог онлайн',
  description:
    'Психолог і гештальт-терапевт про роботу з анорексією, булімією та компульсивним переїданням. Як проходить терапія, скільки триває, з чого почати.',
  h1: 'Розлади харчової поведінки: як виглядає терапія',
  lead: '…',
  published: false,
  updatedAt: '2026-09-08',
  requiresSafetyNote: true,
  sections: [
    { id: 'symptoms', heading: 'Як це проявляється', blocks: [] },
    { id: 'types', heading: 'Які бувають розлади харчової поведінки', blocks: [] },
    { id: 'when-to-seek-help', heading: 'Коли варто звернутися', blocks: [] },
    { id: 'therapy', heading: 'Як проходить терапія зі мною', blocks: [] },
    { id: 'format', heading: 'Формат, тривалість і вартість', blocks: [] },
    { id: 'today', heading: 'Що можна зробити вже сьогодні', blocks: [] },
  ],
  faq: [],
  reviewTags: ['РХП', 'Анорексія', 'Булімія', 'Переїдання'],
  tests: ['eat26', 'binge-eating'],
  ctaMessage: 'Хочу записатися на терапію РХП',
};
```

- [ ] **Step 2: Написати текст секцій**

Обсяг: `lead` + секції ≥ 1000 слів. Джерела — тільки наявні матеріали: `aboutParagraphs`, `services`, `topics`, `faq` з `lib/content.ts`, інтро тестів `eat26` і `bes`, анкети на HoldYou, psihologi.top, qui.help. Клінічні описи — переказ відкритих критеріїв МКХ-11 побутовою мовою: без цифр поширеності, без назв ліків, без обіцянок результату. У кожній секції — щонайменше одне речення від першої особи.

Що має покрити кожна секція:

- `lead` (40–60 слів): пряма відповідь на «чи це РХП і що з цим робити» — перелік трьох розладів, з ким працюю, формат, і що першу розмову можна почати без діагнозу.
- `symptoms` (180–220 слів): обмеження їжі, підрахунок калорій, цикли «переїдання–очищення», їжа як спосіб впоратися з емоціями, ритуали навколо їжі, уникання спільних прийомів їжі, залежність самооцінки від ваги й вигляду. Абзац + `list` із маркерами, які людина впізнає в собі.
- `types` (200–240 слів): три підрозділи-абзаци — анорексія, булімія, компульсивне переїдання — по 2–3 речення про суть кожного, кожен закінчується посиланням у тексті на дочірню сторінку. Посилання оформлюються як частина `paragraph` у Task 4 не підтримуються, тому тут — звичайний текст, а перехід дає блок `TopicRelated` (Task 5).
- `when-to-seek-help` (160–200 слів): ознаки, що самостійно вже не виходить; окремо — `callout` з `tone: 'safety'` про непритомність, блювання з кров'ю, серцебій, різку втрату ваги, думки про самоушкодження: це привід звертатися по медичну допомогу, а не чекати сесії.
- `therapy` (200–240 слів): гештальт-підхід, тілесно-орієнтована робота, психоедукація; що відбувається на першій сесії; що я не змушую їсти й не рахую калорії; за потреби координація з лікарем або дієтологом; власний досвід одужання від РХП як частина того, чому я в цій темі.
- `format` (120–150 слів): онлайн і очно в центрі Києва, 50–60 хвилин, ціна з `prices.eatingDisorder`, оплата за добу, перенесення за 24 години, конфіденційність і псевдонім. Цифри беруться з тексту, а не імпортуються — це контент, а не дані.
- `today` (120–150 слів): три-чотири кроки — пройти EAT-26, описати симптоми письмово, сказати одній близькій людині, написати в Telegram; без тиску «мусиш почати сьогодні».

- [ ] **Step 3: Написати FAQ**

Три-п'ять питань, яких немає серед восьми на головній (`lib/content.ts:232-273`). Наприклад: «Чи потрібен діагноз, щоб почати терапію?», «Чи будете ви зважувати мене й контролювати харчування?», «Що робити, якщо близькі не вірять, що це проблема?», «Чи можна працювати онлайн, якщо я живу не в Києві?». Відповіді — 60–90 слів кожна, від першої особи.

- [ ] **Step 4: Підключити тему в реєстр**

У `lib/topics/index.ts`:

```ts
import { eatingDisorders } from './eating-disorders';
import type { TopicDefinition } from './types';

/** Порядок визначає видачу в футері, sitemap і llms.txt. */
export const topics: readonly TopicDefinition[] = [eatingDisorders];
```

- [ ] **Step 5: Перевірити структуру**

Run: `npm run check:topics`
Expected: `Усі перевірки пройдено (тем у реєстрі: 1).` Перевірки обсягу не запускаються, бо `published: false`.

- [ ] **Step 6: Перевірити обсяг вручну, тимчасово ввімкнувши прапорець**

```bash
sed -i '' 's/published: false/published: true/' lib/topics/eating-disorders.ts
npm run check:topics
sed -i '' 's/published: true/published: false/' lib/topics/eating-disorders.ts
```

Expected: у ввімкненому стані рядок `ok   eating-disorders: <N> слів, <M> FAQ, 4 відгуків` без жодного FAIL. Якщо слів менше 1000 — дописати текст і повторити.

- [ ] **Step 7: Коміт**

```bash
git add lib/topics
git commit -m "content: чернетка сторінки про розлади харчової поведінки"
```

---

## Task 4: Маршрут і каркас сторінки

**Files:**
- Create: `app/[slug]/page.tsx`
- Create: `components/topics/TopicPage.tsx`
- Create: `components/topics/TopicBody.tsx`
- Create: `components/topics/TopicToc.tsx`
- Create: `components/Breadcrumbs.tsx`
- Create: `components/topics/TopicPage.module.css`

**Interfaces:**
- Consumes: `visibleTopics()`, `getTopic()`, `topicPath()`, `TopicDefinition` з Task 2; тема з Task 3.
- Produces: `<TopicPage topic />`, `<TopicBody sections />`, `<TopicToc sections />`, `<Breadcrumbs trail />` з `trail: readonly { name: string; path: string }[]`.

- [ ] **Step 1: Створити `components/Breadcrumbs.tsx`**

```tsx
import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

export type Crumb = { name: string; path: string };

/** «Головна» додається автоматично; trail — лише подальші рівні. */
export function Breadcrumbs({ trail }: { trail: readonly Crumb[] }) {
  const items: readonly Crumb[] = [{ name: 'Головна', path: '/' }, ...trail];

  return (
    <nav className={styles.crumbs} aria-label="Навігація сторінками">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.path} className={styles.crumb}>
            {isLast ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <>
                <Link href={item.path}>{item.name}</Link>
                <span aria-hidden="true"> · </span>
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Створити `components/Breadcrumbs.module.css`**

```css
.crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--olive);
  margin-bottom: 24px;
}

.crumb a:hover {
  color: var(--clay);
}
```

- [ ] **Step 3: Створити `components/topics/TopicToc.tsx`**

```tsx
import type { TopicSection } from '@/lib/topics';
import styles from './TopicPage.module.css';

/** Список підтем із якорями: орієнтир для читача і перелік розділів для краулера. */
export function TopicToc({ sections }: { sections: readonly TopicSection[] }) {
  return (
    <nav className={styles.toc} aria-label="Зміст сторінки">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.heading}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 4: Створити `components/topics/TopicBody.tsx`**

```tsx
import type { TopicSection } from '@/lib/topics';
import styles from './TopicPage.module.css';

export function TopicBody({ sections }: { sections: readonly TopicSection[] }) {
  return (
    <div className={styles.body}>
      {sections.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
          <h2 id={`${section.id}-title`}>{section.heading}</h2>

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
```

Індекс як `key` тут допустимий: блоки статичні й не переставляються.

- [ ] **Step 5: Створити `components/topics/TopicPage.tsx` — поки без блоків довіри**

```tsx
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
```

- [ ] **Step 6: Створити `components/topics/TopicPage.module.css`**

```css
.page {
  padding: 120px 0 90px;
  background: var(--white);
}

.inner {
  max-width: 780px;
}

.title {
  font-size: clamp(34px, 4.4vw, 56px);
  margin-bottom: 18px;
}

.lead {
  margin-bottom: 32px;
}

.toc {
  border-left: 2px solid var(--line);
  padding: 4px 0 4px 18px;
  margin-bottom: 44px;
}

.toc ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
}

.toc a {
  font-size: 15px;
  color: var(--olive);
  transition: 0.2s;
}

.toc a:hover {
  color: var(--clay);
}

.body {
  display: flex;
  flex-direction: column;
  gap: 44px;
  font-size: 17px;
  line-height: 1.7;
}

.body h2 {
  font-size: clamp(24px, 2.6vw, 32px);
  margin-bottom: 16px;
}

.body p {
  margin-bottom: 14px;
}

.body ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 14px 18px;
  list-style: disc;
}

.note,
.safety {
  border-radius: 14px;
  padding: 18px 20px;
  margin: 18px 0;
  font-size: 16px;
}

.note {
  background: var(--sand);
}

.safety {
  background: var(--sand);
  border-left: 3px solid var(--clay);
}

@media (max-width: 640px) {
  .page {
    padding: 96px 0 70px;
  }

  .body {
    gap: 34px;
    font-size: 16px;
  }
}
```

Змінні `--white`, `--olive`, `--clay`, `--line`, `--sand` уже визначені глобально — звірити назви в `app/globals.css` і, якщо `--sand` немає, взяти наявний світлий фон секцій.

- [ ] **Step 7: Створити `app/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopicPage } from '@/components/topics/TopicPage';
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

  return <TopicPage topic={topic} />;
}
```

Власного CSS-модуля маршрут не має: усі стилі сторінки живуть у `components/topics/TopicPage.module.css`.

- [ ] **Step 8: Перевірити рендер і відсутність регресій маршрутизації**

```bash
npm run build && npm run start &
sleep 4
curl -s -o /dev/null -w '%{http_code} /eating-disorders\n' localhost:3000/eating-disorders
curl -s -o /dev/null -w '%{http_code} /about\n' localhost:3000/about
curl -s -o /dev/null -w '%{http_code} /tests\n' localhost:3000/tests
curl -s -o /dev/null -w '%{http_code} /tests/eat26\n' localhost:3000/tests/eat26
curl -s -o /dev/null -w '%{http_code} /llms.txt\n' localhost:3000/llms.txt
curl -s localhost:3000/eating-disorders | grep -c '<h2 id="'
kill %1
```

Expected: `200` для всіх п'яти адрес; лічильник `<h2 id="` дорівнює кількості секцій теми (6).

- [ ] **Step 9: Коміт**

```bash
git add app/\[slug\] components/Breadcrumbs.tsx components/Breadcrumbs.module.css components/topics
git commit -m "feat: маршрут і каркас тематичної сторінки"
```

---

## Task 5: Перехресні посилання й тести

**Files:**
- Create: `components/topics/TopicRelated.tsx`
- Create: `components/topics/TopicTests.tsx`
- Modify: `components/topics/TopicPage.tsx`
- Modify: `components/topics/TopicPage.module.css`

**Interfaces:**
- Consumes: `childrenOf()`, `siblingsOf()`, `getTopic()`, `topicPath()` з Task 2; `tests`, `testPath` з `lib/tests`.
- Produces: `<TopicRelated topic />`, `<TopicTests slugs />`.

- [ ] **Step 1: Створити `components/topics/TopicRelated.tsx`**

```tsx
import Link from 'next/link';
import { childrenOf, getTopic, siblingsOf, type TopicDefinition, topicPath } from '@/lib/topics';
import styles from './TopicPage.module.css';

/**
 * Хаб веде на дітей, дитина — на хаб і сестер. Анкор дорівнює h1 цільової
 * сторінки: описове посилання і для читача, і для пошуку.
 */
export function TopicRelated({ topic }: { topic: TopicDefinition }) {
  const parent = topic.parent ? getTopic(topic.parent) : undefined;
  const related = parent ? [parent, ...siblingsOf(topic)] : childrenOf(topic.slug);

  if (related.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby="related-title">
      <h2 id="related-title">Суміжні теми</h2>

      <ul>
        {related.map((item) => (
          <li key={item.slug}>
            <Link href={topicPath(item.slug)}>{item.h1}</Link>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Створити `components/topics/TopicTests.tsx`**

```tsx
import Link from 'next/link';
import { questionsLabel, tests, testPath } from '@/lib/tests';
import styles from './TopicPage.module.css';

export function TopicTests({ slugs }: { slugs: readonly string[] }) {
  const items = slugs
    .map((slug) => tests.find((test) => test.slug === slug))
    .filter((test) => test !== undefined);

  if (items.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby="topic-tests-title">
      <h2 id="topic-tests-title">Перевірити себе</h2>

      <ul>
        {items.map((test) => (
          <li key={test.slug}>
            <Link href={testPath(test.slug)}>{test.title}</Link>
            <p>
              {test.summary} {test.source}, {questionsLabel(test.questions.length)}, ~
              {test.estimatedMinutes} хв.
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Підключити обидва блоки в `TopicPage`**

Після `<TopicBody …/>` додати:

```tsx
        <TopicRelated topic={topic} />
        <TopicTests slugs={topic.tests} />
```

І дописати імпорти:

```tsx
import { TopicRelated } from './TopicRelated';
import { TopicTests } from './TopicTests';
```

- [ ] **Step 4: Додати стилі в `TopicPage.module.css`**

```css
.related {
  margin-top: 52px;
  padding-top: 32px;
  border-top: 1px solid var(--line);
}

.related h2 {
  font-size: clamp(22px, 2.2vw, 28px);
  margin-bottom: 20px;
}

.related ul {
  display: grid;
  gap: 18px;
  list-style: none;
}

.related li a {
  font-size: 18px;
  font-weight: 500;
  border-bottom: 1px solid var(--line);
  transition: 0.2s;
}

.related li a:hover {
  color: var(--clay);
  border-color: var(--clay);
}

.related li p {
  margin-top: 6px;
  font-size: 15px;
  color: var(--olive);
}
```

- [ ] **Step 5: Перевірити**

```bash
npm run build && npm run start &
sleep 4
curl -s localhost:3000/eating-disorders | grep -c 'href="/tests/eat26"'
curl -s localhost:3000/eating-disorders | grep -c 'Перевірити себе'
curl -s localhost:3000/eating-disorders | grep -c 'Суміжні теми'
kill %1
```

Expected: `1`, `1`, `0`. Блок тестів рендериться; блок суміжних тем повертає `null`, бо дочірніх тем ще немає в реєстрі — його наповнений стан перевіряється в Task 10, Step 11, коли з'являться діти.

- [ ] **Step 6: Коміт**

```bash
git add components/topics
git commit -m "feat: перехресні посилання й тести на тематичній сторінці"
```

---

## Task 6: Блоки довіри — відгуки, FAQ, ціни, CTA

**Files:**
- Modify: `components/Faq.tsx`
- Modify: `components/topics/TopicPage.tsx`
- Create: `components/topics/TopicCta.tsx`
- Modify: `lib/analytics.ts:15-27,43-56` (нове джерело CTA)
- Modify: `components/topics/TopicPage.module.css`

**Interfaces:**
- Consumes: `reviewsByTags()` з Task 1, `Reviews` з опційними пропсами з Task 1.
- Produces: `<Faq items? heading? eyebrow? lead? />`, `<TopicCta message />`, нове значення `TelegramCtaSource = 'topic_cta'`.

Ціни рендеримо наявним компонентом `Pricing` без змін: у нього три тарифи з власними `ctaSource`, і підміна їхніх посилань зламала б аналітику. Тему в CTA доносить окремий блок `TopicCta`.

- [ ] **Step 1: Додати джерело CTA в `lib/analytics.ts`**

У `TelegramCtaSource` після `'test_result_cta'`:

```ts
  | 'test_result_cta'
  | 'topic_cta';
```

У `TelegramCtaSection` (`lib/analytics.ts:29`) додати нову секцію останнім членом union:

```ts
  | 'topic';
```

У мапі `ctaSection` після `test_result_cta`:

```ts
  test_result_cta: 'test',
  topic_cta: 'topic',
```

- [ ] **Step 2: Створити `components/topics/TopicCta.tsx`**

```tsx
import { TelegramLink } from '@/components/TelegramLink';
import { telegramLink } from '@/lib/site';
import styles from './TopicPage.module.css';

/** Повідомлення заздалегідь називає тему, щоб перша репліка в чаті була по суті. */
export function TopicCta({ message }: { message: string }) {
  return (
    <section className={styles.cta} aria-labelledby="topic-cta-title">
      <h2 id="topic-cta-title">Записатися на сесію</h2>
      <p>
        Напишіть мені в Telegram — відповім і разом визначимо, з чого почати. Перше повідомлення
        вже буде заповнене, його можна змінити.
      </p>
      <TelegramLink href={telegramLink(message)} source="topic_cta" className="btn btn-fill">
        Написати мені <span className="arw">&#x27F6;</span>
      </TelegramLink>
    </section>
  );
}
```

- [ ] **Step 3: Зробити пропси `Faq` опційними**

```tsx
import { faq as siteFaq, type Accordion } from '@/lib/content';
import { AccordionList } from './AccordionList';
import styles from './Faq.module.css';

export function Faq({
  items = siteFaq,
  eyebrow = 'Поширені запитання',
  heading = 'Відповіді на важливі питання',
  lead = 'Про підхід, формат сесій, конфіденційність і оплату.',
}: {
  items?: readonly Accordion[];
  eyebrow?: string;
  heading?: string;
  lead?: string;
} = {}) {
  return (
    <section className={styles.steps} id="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="faq-title">
            {heading}
            <span className="dot">.</span>
          </h2>
          <p className="lead">{lead}</p>
        </div>

        <div className={styles.list}>
          <AccordionList items={items} defaultOpenFirst />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Зібрати повну сторінку в `TopicPage.tsx`**

Повний файл після змін:

```tsx
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

      <Pricing />
    </>
  );
}
```

- [ ] **Step 5: Додати стилі CTA**

```css
.cta {
  margin-top: 52px;
  padding-top: 32px;
  border-top: 1px solid var(--line);
}

.cta h2 {
  font-size: clamp(22px, 2.2vw, 28px);
  margin-bottom: 12px;
}

.cta p {
  margin-bottom: 20px;
}
```

- [ ] **Step 6: Перевірити, що головна не зачеплена, а на темі є всі блоки**

```bash
npm run typecheck && npm run lint && npm run build && npm run start &
sleep 4
curl -s localhost:3000 | grep -c 'Відповіді на важливі питання'
curl -s localhost:3000/eating-disorders | grep -c 'Часті запитання'
curl -s localhost:3000/eating-disorders | grep -o 'Прозорі ціни' | head -1
curl -s localhost:3000/eating-disorders | grep -o 'topic_cta' | head -1
kill %1
```

Expected: `1` для головної (дефолтний заголовок FAQ на місці), `1` для теми, знайдені «Прозорі ціни»; `topic_cta` у розмітці може не з'явитися, бо джерело передається в обробник кліку — відсутність цього рядка не є помилкою.

- [ ] **Step 7: Коміт**

```bash
git add components lib/analytics.ts
git commit -m "feat: відгуки, FAQ, ціни й CTA на тематичній сторінці"
```

---

## Task 7: Структуровані дані

**Files:**
- Modify: `lib/jsonLd.ts:86-150`
- Modify: `app/[slug]/page.tsx`

**Interfaces:**
- Consumes: `breadcrumbs()` (наявний приватний хелпер), `TopicDefinition`.
- Produces: `buildTopicJsonLd(topic: TopicDefinition)`.

- [ ] **Step 1: Додати `buildTopicJsonLd` у `lib/jsonLd.ts`**

Наприкінці файлу:

```ts
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
```

Дописати імпорти вгорі файлу:

```ts
import { getTopic, topicPath } from './topics';
import type { TopicDefinition } from './topics/types';
```

- [ ] **Step 2: Підключити розмітку на сторінці**

У `app/[slug]/page.tsx` імпортувати `JsonLd` і `buildTopicJsonLd`, а в `Page` обгорнути вивід:

```tsx
  return (
    <>
      <JsonLd data={buildTopicJsonLd(topic)} />
      <TopicPage topic={topic} />
    </>
  );
```

Звірити сигнатуру `JsonLd` у `components/JsonLd.tsx` і передати проп із тією ж назвою, що на головній і на сторінці тесту.

- [ ] **Step 3: Перевірити JSON-LD**

```bash
npm run build && npm run start &
sleep 4
curl -s localhost:3000/eating-disorders \
  | grep -o '"@type":"[A-Za-z]*"' | sort | uniq -c
kill %1
```

Expected: серед типів присутні `WebPage`, `BreadcrumbList`, `ListItem`, `FAQPage`, `Question`, `Answer`, `MedicalCondition`.

- [ ] **Step 4: Перевірити валідність зовнішнім інструментом**

Після наступного превʼю-деплою прогнати URL сторінки через Rich Results Test (`https://search.google.com/test/rich-results`). Expected: помилок немає; попередження про відсутні необов'язкові поля допустимі.

- [ ] **Step 5: Коміт**

```bash
git add lib/jsonLd.ts app/\[slug\]/page.tsx
git commit -m "feat: JSON-LD для тематичних сторінок"
```

---

## Task 8: Sitemap і реальні дати оновлення

Зараз `lastModified` для всіх URL — дата збірки. Це шум: сайт повідомляє про зміну кожного разу, коли деплой пройшов без правок контенту.

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `lib/site.ts:41-56` (додати `updatedAt`)
- Modify: `lib/tests/types.ts` (додати `updatedAt` у `TestDefinition`)
- Modify: `lib/tests/gad7.ts`, `phq9.ts`, `ybocs.ts`, `dass21.ts`, `bes.ts`, `ecrR.ts`, `eat26.ts`

**Interfaces:**
- Consumes: `visibleTopics()`, `topicPath()`.
- Produces: `site.updatedAt`, `TestDefinition.updatedAt`.

- [ ] **Step 1: Додати дату головної в `lib/site.ts`**

У об'єкт `site` після `lang`:

```ts
  /** Дата останньої змістовної правки головної. Оновлювати руками разом із текстом. */
  updatedAt: '2026-09-07',
```

- [ ] **Step 2: Додати поле в `TestDefinition`**

У `lib/tests/types.ts` поряд зі `slug`:

```ts
  /** ISO-дата останньої змістовної правки сторінки тесту. */
  updatedAt: string;
```

- [ ] **Step 3: Проставити дату в семи файлах тестів**

У кожному з `gad7.ts`, `phq9.ts`, `ybocs.ts`, `dass21.ts`, `bes.ts`, `ecrR.ts`, `eat26.ts` додати рядок після `slug`:

```ts
  updatedAt: '2026-08-16',
```

Дата — коли розділ тестів вийшов (див. спеку `2026-08-16-tests-section-design.md`). Тексти тестів відтоді не змінювалися, тож це і є правдива дата.

- [ ] **Step 4: Переписати `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { testPath, tests, testsHubPath } from '@/lib/tests';
import { topicPath, visibleTopics } from '@/lib/topics';

/** lastModified беремо з даних, а не з дати збірки: інакше кожен деплой виглядає як правка. */
export default function sitemap(): MetadataRoute.Sitemap {
  const topics = visibleTopics();

  const latestTopicDate = topics
    .map((topic) => topic.updatedAt)
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
      lastModified: new Date(latestTopicDate ?? site.updatedAt),
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
```

Хаб тестів власного контенту майже не має — він перелічує тести, тому його дата дорівнює найсвіжішій даті в реєстрах. Якщо тем ще немає, береться дата головної.

- [ ] **Step 5: Перевірити**

```bash
npm run typecheck && npm run build && npm run start &
sleep 4
curl -s localhost:3000/sitemap.xml | grep -o '<loc>[^<]*</loc>' | wc -l
curl -s localhost:3000/sitemap.xml | grep -o '<lastmod>[^<]*</lastmod>' | sort -u
kill %1
```

Expected: кількість URL = 1 (головна) + кількість видимих тем + 1 (хаб тестів) + 7 (тести). Дат більше однієї, і серед них немає сьогоднішньої дати збірки (якщо сьогодні не 2026-09-08).

- [ ] **Step 6: Коміт**

```bash
git add app/sitemap.ts lib/site.ts lib/tests
git commit -m "fix: реальні дати оновлення в sitemap замість дати збірки"
```

---

## Task 9: Головна, футер і llms.txt

**Files:**
- Modify: `app/llms.txt/route.ts:53-59`
- Modify: `components/Topics.tsx`
- Modify: `components/Topics.module.css`
- Modify: `lib/content.ts:445-451` (`footerTopics`)

**Interfaces:**
- Consumes: `visibleTopics()`, `topicPath()`.

- [ ] **Step 1: Додати розділ тем у `llms.txt`**

У `buildLlmsTxt()` після блоку `## Сторінки` вставити:

```ts
    '## Теми',
    '',
    ...visibleTopics().flatMap((topic) => [
      `### [${topic.h1}](${url(topicPath(topic.slug))})`,
      '',
      topic.lead,
      '',
      ...topic.faq.flatMap((item) => [`- ${item.question} ${item.answer}`]),
      '',
    ]),
```

Дописати імпорт:

```ts
import { topicPath, visibleTopics } from '@/lib/topics';
```

- [ ] **Step 2: Додати посилання на теми в перелік сторінок `llms.txt`**

У блоці `## Сторінки` після рядка про тести:

```ts
    ...visibleTopics().map(
      (topic) => `- [${topic.h1}](${url(topicPath(topic.slug))}): ${topic.description}`,
    ),
```

- [ ] **Step 3: Перетворити акордеон на головній у список із посиланнями**

`components/Topics.tsx` — замінити `<AccordionList items={topics} defaultOpenFirst />` на список карток. Кожен пункт `topics` із `lib/content.ts` зіставляється з темою реєстру за новим необов'язковим полем; щоб не заводити зайвої структури, зіставлення робимо явним масивом у самому компоненті:

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { topics } from '@/lib/content';
import { getTopic, topicPath } from '@/lib/topics';
import styles from './Topics.module.css';

/** Пункт акордеону → сторінка теми. Пункти без сторінки лишаються текстом. */
const TOPIC_SLUGS: Record<string, string | undefined> = {
  'РХП — розлади харчової поведінки': 'eating-disorders',
  'Тривога та тривожні розлади': 'anxiety-and-panic-attacks',
};

export function Topics() {
  return (
    <section className={styles.reach} id="topics" aria-labelledby="topics-title">
      <div className="blob blob-b" aria-hidden="true" />

      <div className={`wrap ${styles.inner}`}>
        <div>
          <p className="eyebrow">Коли варто прийти</p>
          {/* Пробіл перед <br> — інакше в екстрагованому тексті «можудопомогти». */}
          <h2 id="topics-title">
            З чим я можу{' '}
            <br />
            допомогти<span className="dot">.</span>
          </h2>
          <p className={`lead ${styles.lead}`}>
            Не обов&#8217;язково чекати, поки стане нестерпно. Ось із чим найчастіше звертаються.
          </p>

          <ul className={styles.topics}>
            {topics.map((item) => {
              const slug = TOPIC_SLUGS[item.question];
              const topic = slug ? getTopic(slug) : undefined;

              return (
                <li key={item.question}>
                  {topic ? (
                    <Link href={topicPath(topic.slug)} className={styles.topicLink}>
                      {topic.h1}
                    </Link>
                  ) : (
                    <span className={styles.topicName}>{item.question}</span>
                  )}
                  <p>{item.answer}</p>
                </li>
              );
            })}
          </ul>

          <div className={`btns ${styles.actions}`}>
            <a href="#contact" className="btn btn-fill">
              Написати мені <span className="arw">&#x27F6;</span>
            </a>
          </div>
        </div>

        <div className="photo arch-leaf cert-frame">
          <Image
            src="/kristel-sertifikat7.webp"
            alt="Сертифікат — гештальт-підхід у роботі з панічними атаками"
            fill
            sizes="(max-width: 900px) 90vw, 45vw"
          />
        </div>
      </div>
    </section>
  );
}
```

Ключ у `TOPIC_SLUGS` — це `question` з `lib/content.ts:204-230` дослівно. Підліткова тема в акордеоні окремим пунктом не представлена, тому в мапі її немає; вихід на `/teens` дають футер і перехресні посилання.

- [ ] **Step 4: Додати стилі списку в `Topics.module.css`**

```css
.topics {
  display: flex;
  flex-direction: column;
  gap: 20px;
  list-style: none;
  margin-bottom: 32px;
}

.topicLink,
.topicName {
  font-size: 19px;
  font-weight: 500;
}

.topicLink {
  border-bottom: 1px solid var(--line);
  transition: 0.2s;
}

.topicLink:hover {
  color: var(--clay);
  border-color: var(--clay);
}

.topics li p {
  margin-top: 6px;
  font-size: 16px;
  color: var(--olive);
}
```

Клас `.acc` більше не використовується в цій секції; глобальні стилі акордеону лишаються для `Faq`.

- [ ] **Step 5: Перенаправити `footerTopics`**

У `lib/content.ts` замінити масив:

```ts
export const footerTopics: readonly NavItem[] = [
  { href: '/eating-disorders', label: 'РХП · анорексія · булімія' },
  { href: '/anxiety-and-panic-attacks', label: 'Тривога · панічні атаки' },
  { href: '/teens', label: 'Підліткова терапія' },
  { href: '/services', label: 'Самооцінка · прийняття себе' },
  { href: '/pricing', label: 'Онлайн-сесії' },
];
```

Саме тому Task 9 виконується після Task 10: до нього тем `/anxiety-and-panic-attacks` і `/teens` немає навіть у реєстрі. Оскільки в проді `visibleTopics()` віддає лише опубліковані теми, перед мерджем у `main` треба переконатися, що всі три адреси опубліковані — інакше тимчасово повернути відповідні пункти на `/services` (перевірка в Task 11, Step 5).

- [ ] **Step 6: Перевірити**

```bash
npm run build && npm run start &
sleep 4
curl -s localhost:3000 | grep -o 'href="/eating-disorders"' | head -1
curl -s localhost:3000/llms.txt | grep -o '^## Теми'
curl -s localhost:3000/llms.txt | grep -c '^### '
kill %1
```

Expected: посилання на головній знайдено; розділ `## Теми` присутній; кількість `###` дорівнює кількості видимих тем.

- [ ] **Step 7: Коміт**

```bash
git add app/llms.txt/route.ts components/Topics.tsx components/Topics.module.css lib/content.ts
git commit -m "feat: посилання на теми на головній, у футері та llms.txt"
```

---

## Task 10: Тексти решти п'яти тем

П'ять окремих підзадач, кожна — свій файл, свій коміт, свій прогін `check:topics`. Вимоги до тексту — ті самі, що в Task 3, Step 2–3: ≥ 800 слів, обов'язкові секції в порядку, 3–5 унікальних FAQ, перша особа в кожній секції, джерела лише з наявних матеріалів.

**Files:**
- Create: `lib/topics/anorexia.ts`, `lib/topics/bulimia.ts`, `lib/topics/binge-eating.ts`, `lib/topics/anxiety-and-panic-attacks.ts`, `lib/topics/teens.ts`
- Modify: `lib/topics/index.ts`

- [ ] **Step 1: `lib/topics/anorexia.ts`**

```ts
import type { TopicDefinition } from './types';

export const anorexia: TopicDefinition = {
  slug: 'anorexia',
  title: 'Терапія анорексії — психолог онлайн і в Києві',
  description:
    'Як проходить психотерапія анорексії: з чого починаємо, чому не змушую їсти, скільки триває робота. Гештальт-підхід, онлайн і очно в Києві.',
  h1: 'Анорексія: терапія без тиску й контролю',
  lead: '…',
  published: false,
  updatedAt: '2026-09-08',
  parent: 'eating-disorders',
  requiresSafetyNote: true,
  sections: [
    { id: 'symptoms', heading: 'Як це проявляється', blocks: [] },
    { id: 'difference', heading: 'Чим анорексія відрізняється від інших РХП', blocks: [] },
    { id: 'when-to-seek-help', heading: 'Коли варто звернутися', blocks: [] },
    { id: 'therapy', heading: 'Як проходить терапія зі мною', blocks: [] },
    { id: 'format', heading: 'Формат, тривалість і вартість', blocks: [] },
    { id: 'today', heading: 'Що можна зробити вже сьогодні', blocks: [] },
  ],
  faq: [],
  reviewTags: ['Анорексія'],
  tests: ['eat26', 'anxiety'],
  ctaMessage: 'Хочу записатися на терапію анорексії',
};
```

Секція `difference` (140–180 слів) описує, чим анорексія відрізняється від булімії та переїдання, і словами згадує обидві теми — перехід дає `TopicRelated`. Callout безпеки: непритомність, брадикардія, аменорея, різка втрата ваги — привід до лікаря, а не до очікування сесії.

- [ ] **Step 2: Запустити перевірку і закомітити**

```bash
npm run check:topics
git add lib/topics
git commit -m "content: чернетка сторінки про анорексію"
```

- [ ] **Step 3: `lib/topics/bulimia.ts`**

Той самий каркас із такими метаданими:

```ts
  slug: 'bulimia',
  title: 'Терапія булімії — психолог онлайн',
  description:
    'Психотерапія булімії: як розірвати цикл «переїдання–очищення», чому сором заважає звернутися і як виглядає робота в гештальт-підході.',
  h1: 'Булімія: як виходити з циклу переїдання й очищення',
  parent: 'eating-disorders',
  requiresSafetyNote: true,
  reviewTags: ['Булімія'],
  tests: ['eat26', 'binge-eating'],
  ctaMessage: 'Хочу записатися на терапію булімії',
```

Секція `difference` — про відмінність від анорексії (вага часто в межах норми, тому оточення не помічає) і від компульсивного переїдання (наявність компенсаторної поведінки). Callout безпеки: блювання з кров'ю, порушення серцевого ритму, судоми через втрату електролітів.

- [ ] **Step 4: Перевірка й коміт**

```bash
npm run check:topics
git add lib/topics
git commit -m "content: чернетка сторінки про булімію"
```

- [ ] **Step 5: `lib/topics/binge-eating.ts`**

```ts
  slug: 'binge-eating',
  title: 'Компульсивне переїдання — терапія в психолога',
  description:
    'Що таке компульсивне переїдання, чим воно відрізняється від звички «заїдати» стрес і як влаштована терапія: тригери, емоції, повернення до сигналів тіла.',
  h1: 'Компульсивне переїдання: коли їжа стає способом впоратися',
  parent: 'eating-disorders',
  requiresSafetyNote: false,
  reviewTags: ['Переїдання'],
  tests: ['binge-eating', 'eat26'],
  ctaMessage: 'Хочу записатися на терапію компульсивного переїдання',
```

Callout безпеки не потрібен; замість нього доречний `callout` з `tone: 'info'` про те, що дієти зазвичай посилюють цикл.

Slug теми збігається зі slug тесту `binge-eating`, і це допустимо: шляхи `/binge-eating` та `/tests/binge-eating` не конфліктують, а `check-topics.ts` такого збігу не забороняє (див. Task 2, Step 3).

- [ ] **Step 6: Перевірка й коміт**

```bash
npm run check:topics
git add lib/topics
git commit -m "content: чернетка сторінки про компульсивне переїдання"
```

- [ ] **Step 7: `lib/topics/anxiety-and-panic-attacks.ts`**

```ts
  slug: 'anxiety-and-panic-attacks',
  title: 'Тривога й панічні атаки — психолог онлайн',
  description:
    'Терапія тривожних станів і панічних атак: що відбувається з тілом під час атаки, як собі допомогти в моменті й що дає регулярна робота з психологом.',
  h1: 'Тривога й панічні атаки: як повернути собі опору',
  requiresSafetyNote: true,
  reviewTags: ['Тривога', 'Тривожні стани', 'Панічні атаки'],
  tests: ['anxiety', 'dass21', 'ocd'],
  ctaMessage: 'Хочу записатися на терапію тривоги й панічних атак',
```

Без `parent`, тож поріг відгуків — ≥ 2 (за трьома тегами їх три). Секції — базові п'ять, без `difference` і `types`. Callout безпеки: біль у грудях, задишка й серцебій уперше — це привід виключити кардіологічну причину, а не одразу вважати панічною атакою.

- [ ] **Step 8: Перевірка й коміт**

```bash
npm run check:topics
git add lib/topics
git commit -m "content: чернетка сторінки про тривогу й панічні атаки"
```

- [ ] **Step 9: `lib/topics/teens.ts`**

```ts
  slug: 'teens',
  title: 'Підлітковий психолог — терапія й сесії з батьками',
  description:
    'Робота з підлітками та їхніми батьками: РХП, тривога, булінг, конфлікти вдома. Як влаштована сесія, що лишається конфіденційним, скільки коштує.',
  h1: 'Підліткова терапія та робота з батьками',
  requiresSafetyNote: false,
  reviewTags: ['Підліткова криза', 'Батьки й підлітки', 'Булінг'],
  tests: ['anxiety', 'depression'],
  ctaMessage: 'Хочу записатися на підліткову терапію',
```

Окремо розкрити межі конфіденційності підлітка перед батьками й формат парної сесії з `plans` (`teen-pair`, ціна з `prices.teenPair`).

- [ ] **Step 10: Підключити всі теми в реєстр**

`lib/topics/index.ts`, початок файлу:

```ts
import { anorexia } from './anorexia';
import { anxietyAndPanicAttacks } from './anxiety-and-panic-attacks';
import { bingeEating } from './binge-eating';
import { bulimia } from './bulimia';
import { eatingDisorders } from './eating-disorders';
import { teens } from './teens';
import type { TopicDefinition } from './types';

/** Порядок визначає видачу в футері, sitemap і llms.txt. */
export const topics: readonly TopicDefinition[] = [
  eatingDisorders,
  anorexia,
  bulimia,
  bingeEating,
  anxietyAndPanicAttacks,
  teens,
];
```

- [ ] **Step 11: Наскрізна перевірка всіх шести**

```bash
npm run check:topics && npm run typecheck && npm run lint && npm run build && npm run start &
sleep 4
for slug in eating-disorders anorexia bulimia binge-eating anxiety-and-panic-attacks teens; do
  curl -s -o /dev/null -w "%{http_code} /$slug\n" "localhost:3000/$slug"
done
curl -s localhost:3000/anorexia | grep -o 'Суміжні теми' | head -1
curl -s localhost:3000/sitemap.xml | grep -c '<loc>'
kill %1
```

Expected: шість разів `200`; на сторінці анорексії блок «Суміжні теми» присутній (хаб + дві сестри); у sitemap 15 URL (1 головна + 6 тем + 1 хаб тестів + 7 тестів).

- [ ] **Step 12: Коміт**

```bash
git add lib/topics
git commit -m "content: чернетки сторінок про підлітків і повний реєстр тем"
```

---

## Task 11: Превʼю, вичитка і публікація

**Files:**
- Modify: `lib/topics/*.ts` (прапорці `published`)

- [ ] **Step 1: Запушити гілку й отримати превʼю**

```bash
git push -u origin feat/topic-pages
```

Vercel зібере превʼю-деплой. Усі шість сторінок на ньому видно (`visibleTopics()` у не-проді віддає чернетки), і весь превʼю віддає `X-Robots-Tag: noindex`.

- [ ] **Step 2: Перевірити заголовок noindex на превʼю**

```bash
curl -sI https://<preview-host>/anorexia | grep -i x-robots-tag
```

Expected: `x-robots-tag: noindex, nofollow`.

- [ ] **Step 3: Передати посилання Крістель на вичитку**

Надіслати шість URL превʼю плюс перелік того, що потребує її підтвердження: тексти сторінок, FAQ, мапінг тегів відгуків із Task 1 Step 2. Правки вносити в `lib/topics/*.ts`, кожна тема — окремий коміт.

- [ ] **Step 4: Публікувати по одній темі після «ок»**

Для кожної підтвердженої теми:

```bash
# у файлі теми: published: false → true, updatedAt → дата підтвердження
npm run check:topics
git add lib/topics
git commit -m "content: публікація сторінки <тема>"
```

Порядок публікації: `eating-disorders` першою, бо на неї посилаються діти.

- [ ] **Step 5: Перевірити готовність футера перед мерджем**

`footerTopics` (Task 9, Step 5) посилається на `/eating-disorders`, `/anxiety-and-panic-attacks`, `/teens`. Якщо якась із трьох ще не опублікована, тимчасово замінити її href на `/services`.

Run: `npm run build && npm run start & sleep 4; for p in $(curl -s localhost:3000 | grep -o 'href="/[a-z-]*"' | sort -u | sed 's/href="//;s/"//'); do curl -s -o /dev/null -w "%{http_code} $p\n" "localhost:3000$p"; done; kill %1`
Expected: жодного `404`.

- [ ] **Step 6: Фінальна перевірка перед мерджем**

```bash
npm run lint && npm run typecheck && npm run check:tests && npm run check:topics && npm run build
```

Expected: усе чисто.

- [ ] **Step 7: Мердж і деплой**

Мердж у `main` виконується **лише після явного підтвердження користувача** — деплой у прод із `main` автоматичний.

- [ ] **Step 8: Перевірка на проді**

```bash
for slug in eating-disorders anorexia bulimia binge-eating anxiety-and-panic-attacks teens; do
  curl -s -o /dev/null -w "%{http_code} $slug\n" "https://www.psykristel.com/$slug"
done
curl -s https://www.psykristel.com/sitemap.xml | grep -c '<loc>'
curl -s https://www.psykristel.com/llms.txt | grep -c '^### '
```

Expected: `200` для опублікованих тем, `404` для ще неопублікованих; sitemap і `llms.txt` містять рівно опубліковані.

- [ ] **Step 9: Надіслати sitemap у GSC і Bing Webmaster Tools**

Це ручний крок поза кодом. Після нього — чекати індексації й міряти за критеріями успіху зі спеки.

---

## Task 12: Синхронізація документів

**Files:**
- Modify: `docs/superpowers/specs/2026-09-07-topic-pages-design.md`
- Modify: `docs/seo-growth-roadmap.md`

- [ ] **Step 1: Внести три уточнення у спеку**

Перенести в неї розділ «Уточнення до спеки» з цього плану: механізм `visibleTopics()` замість ручного прапорця для превʼю, наявність `footerTopics`, поріг відгуків ≥ 1 для сторінок з `parent`.

- [ ] **Step 2: Оновити дорожню карту**

Рядок про видалення «5/5» перевести в стан «відхилено 2026-09-08: оцінки лишаються». У рядку підпроєкту 1 змінити стан з `план` на `зроблено` після мерджу, додавши посилання на план.

- [ ] **Step 3: Коміт**

```bash
git add docs
git commit -m "docs: синхронізувати спеку й дорожню карту з реалізацією"
```

---

## Порядок виконання

Task 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 10 → 9 → 11 → 12.

Task 9 виконується після Task 10: він проставляє у футері посилання на `/anxiety-and-panic-attacks` і `/teens`, які до Task 10 не існують навіть як чернетки.
