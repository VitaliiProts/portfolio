# Крістель Кравець — лендінг психолога

Односторінковий сайт психологині та фахівчині з розладів харчової поведінки.
Побудований на **Next.js (App Router) + React + TypeScript** з CSS Modules.

Попередня версія (один файл `index_1.html`) збережена в `legacy/` як довідка.

## Швидкий старт

```bash
npm install
cp .env.example .env.local   # вкажіть реальний домен
npm run dev                  # http://localhost:3000
```

## Скрипти

| Команда             | Що робить                                        |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Дев-сервер із гарячим перезавантаженням          |
| `npm run build`     | Продакшн-збірка (статична генерація сторінки)    |
| `npm run start`     | Запуск продакшн-збірки                           |
| `npm run lint`      | ESLint (`next/core-web-vitals` + TypeScript)     |
| `npm run typecheck` | Перевірка типів без емісії файлів                |

## Змінні середовища

| Змінна                 | Опис                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Канонічний домен. Використовується в `metadataBase`, `sitemap.xml`, `robots.txt` і JSON-LD. |

Якщо змінної немає, підставляється адреса продакшн-деплою Vercel, а вже потім —
запасне значення з `lib/site.ts`.

## Структура

```
app/
  layout.tsx        кореневий layout: шрифти, metadata, хедер/футер, JSON-LD
  page.tsx          головна сторінка — композиція секцій
  globals.css       дизайн-токени, база, спільні примітиви (.wrap, .btn, .acc…)
  robots.ts         /robots.txt через Metadata Routes
  sitemap.ts        /sitemap.xml через Metadata Routes
  not-found.tsx     сторінка 404
components/
  <Section>.tsx     одна секція = один компонент
  <Section>.module.css   локальні стилі секції
  useCarousel.ts    хук горизонтальної прокрутки (формати, відгуки)
  icons.tsx         усі SVG-іконки одним модулем
lib/
  site.ts           контакти, ціни, посилання, форматування
  content.ts        увесь текстовий контент у типізованих структурах
  jsonLd.ts         структуровані дані Schema.org
public/             зображення (WebP)
```

## Принципи, яких дотримується код

- **Серверні компоненти за замовчуванням.** `'use client'` мають лише `Header`
  (бургер-меню), `Services` і `Reviews` (каруселі) та `BookingForm` (валідація й
  відкриття Telegram). Решта сторінки — HTML без JS.
- **Контент відділений від розмітки.** Тексти, ціни, відгуки, FAQ живуть у
  `lib/content.ts`. Змінюємо контент — не чіпаємо компоненти.
- **JSON-LD генерується з того ж контенту**, що й сторінка (`lib/jsonLd.ts`),
  тому структуровані дані не розходяться з видимим текстом.
- **Ціни в одному місці** (`lib/site.ts`) — вони одночасно потрапляють у блок
  тарифів, hero, метаопис і `OfferCatalog`.
- **Стилі:** глобальні токени й примітиви в `globals.css`, усе секційне — у
  CSS-модулях. Жодних інлайн-стилів.
- **Зображення** через `next/image` (AVIF/WebP, `sizes`, ліниве завантаження;
  портрет у hero — `priority`).
- **Доступність:** посилання «перейти до вмісту», `aria-expanded` на бургері,
  нативні `details/summary` в акордеонах, повідомлення форми через `role="alert"`
  і `role="status"`, стрілки каруселі блокуються на краях.

## Деплой на Vercel

Бекенд не потрібен: усі маршрути пререндеряться в статичний HTML, а форма запису
не звертається до сервера — вона відкриває Telegram із готовим текстом.

1. Залийте репозиторій на GitHub:

```bash
git init
git add .
git commit -m "Лендінг психолога на Next.js"
git remote add origin git@github.com:<user>/<repo>.git
git push -u origin main
```

2. На [vercel.com](https://vercel.com) → **Add New… → Project** → імпортуйте репозиторій.
   Next.js визначається автоматично, збірку налаштовувати не треба.
3. **Settings → Environment Variables** → додайте `NEXT_PUBLIC_SITE_URL` зі
   значенням реального домену (наприклад `https://psykristel.com`).
4. **Settings → Domains** → підключіть домен і пропишіть у реєстратора DNS-записи,
   які покаже Vercel.
5. Після зміни домену зробіть **Redeploy**, щоб canonical, `sitemap.xml` і
   Open Graph перегенерувалися з новою адресою.

Далі кожен `git push` у `main` автоматично оновлює продакшн, а пул-реквести
отримують окремі превʼю-посилання.

### Інші хостинги

Проєкт — звичайний Next.js, тож так само працює на Cloudflare Pages, Netlify або
власному VPS (`npm run build && npm run start` за nginx). Для чисто статичного
хостингу (nginx, GitHub Pages) додайте в `next.config.ts` `output: 'export'` і
`images.unoptimized = true` — тоді `npm run build` покладе готовий сайт у `out/`.

### Після деплою

Додайте сайт у [Google Search Console](https://search.google.com/search-console)
і надішліть `sitemap.xml` — це пришвидшить індексацію.
