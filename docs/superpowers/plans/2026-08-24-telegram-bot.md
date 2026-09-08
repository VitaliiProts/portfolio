# Telegram-бот для запису на консультацію — план реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Побудувати Telegram-бота, який показує ціни й відповіді на поширені запитання і збирає заявку на консультацію, надсилаючи її Крістель у Telegram.

**Architecture:** Один довгоживучий Node-процес на grammY із long polling. Стан діалогу запису — у пам'яті процесу (`Map` з TTL), без бази даних. Тексти відокремлені від логіки: `content.ts` не знає про Telegram, `handlers/` не містять текстів, `booking/` — єдине місце зі змінним станом, `notify.ts` — єдине місце, яке знає про чат адміністратора.

**Tech Stack:** TypeScript, grammY, dotenv, вбудований `node:test`, tsx (лише для тестів і дев-режиму), Railway.

Специфікація: `docs/superpowers/specs/2026-08-24-telegram-bot-design.md` (у репозиторії лендінгу).

## Global Constraints

- Новий **окремий репозиторій** `kristel-bot`. Файли лендінгу не змінюємо.
- Node `>=20.9`, ESM (`"type": "module"`), імпорти всередині `src/` з розширенням `.js`.
- Жодної бази даних і жодного запису на диск: заявка живе в пам'яті до моменту надсилання.
- Тексти клієнтів не логуються. У логи йдуть лише технічні помилки та `userId`.
- Токен і `ADMIN_CHAT_ID` — тільки зі змінних оточення. У репозиторій потрапляє лише `.env.example`.
- Мова інтерфейсу — українська. Ціни, як на сайті: індивідуальна сесія 1 600 ₴ / 50–60 хв, терапія РХП 1 600 ₴ / 50–60 хв, парна сесія з батьками 2 000 ₴ / сесія (тривалість не вказується).
- Кризова лінія в текстах: `7333`. Контакт психолога: `@Krav_Kristel`.
- TTL сесії — 30 хвилин, прибирання — раз на 5 хвилин. Надсилання заявки — до 3 спроб.
- TDD: спочатку падаючий тест, потім мінімальна реалізація. Коміт наприкінці кожної задачі.

## Структура файлів

| Файл | Відповідальність |
| --- | --- |
| `src/config.ts` | читання й перевірка `BOT_TOKEN`, `ADMIN_CHAT_ID` |
| `src/content.ts` | усі тексти українською; не імпортує grammY |
| `src/keyboards.ts` | inline-клавіатури та константи `callback_data` |
| `src/booking/session.ts` | чисті переходи станів + сховище сесій із TTL |
| `src/booking/application.ts` | модель заявки, форматування для адміністратора й запасного посилання |
| `src/notify.ts` | надсилання з повторами (не залежить від grammY) |
| `src/handlers/menu.ts` | `/start`, головне меню |
| `src/handlers/prices.ts` | екран цін |
| `src/handlers/faq.ts` | список запитань і відповіді |
| `src/handlers/booking.ts` | покроковий збір заявки |
| `src/handlers/fallback.ts` | вільний текст поза сценарієм |
| `src/index.ts` | збирання бота, polling, `bot.catch`, SIGTERM |

---

### Task 1: Каркас репозиторію та конфігурація

**Files:**
- Create: `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`
- Create: `src/config.ts`
- Test: `test/config.test.ts`

**Interfaces:**
- Consumes: нічого
- Produces: `type Config = { botToken: string; adminChatId: number }`, `loadConfig(env: NodeJS.ProcessEnv): Config`

- [ ] **Step 1: Створити репозиторій і встановити залежності**

```bash
mkdir kristel-bot && cd kristel-bot
git init
npm init -y
npm install grammy dotenv
npm install -D typescript tsx @types/node
```

- [ ] **Step 2: Замінити `package.json`**

```json
{
  "name": "kristel-bot",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Telegram-бот психологині Крістель Кравець: ціни, поширені запитання, запис на консультацію",
  "engines": { "node": ">=20.9" },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "node --import tsx --test test/**/*.test.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

Секції `dependencies` і `devDependencies`, які створив `npm install`, лишити без змін.

- [ ] **Step 3: Створити `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Створити `.gitignore` і `.env.example`**

`.gitignore`:

```
node_modules/
dist/
.env
```

`.env.example`:

```
BOT_TOKEN=123456789:your-token-from-botfather
ADMIN_CHAT_ID=123456789
```

- [ ] **Step 5: Написати падаючий тест `test/config.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';

test('повертає конфіг із валідних змінних оточення', () => {
  const config = loadConfig({ BOT_TOKEN: 'abc', ADMIN_CHAT_ID: '42' });
  assert.deepEqual(config, { botToken: 'abc', adminChatId: 42 });
});

test('повідомляє про всі відсутні змінні одразу', () => {
  assert.throws(() => loadConfig({}), /BOT_TOKEN.*ADMIN_CHAT_ID|ADMIN_CHAT_ID.*BOT_TOKEN/s);
});

test('відхиляє нечисловий ADMIN_CHAT_ID', () => {
  assert.throws(() => loadConfig({ BOT_TOKEN: 'abc', ADMIN_CHAT_ID: 'me' }), /ADMIN_CHAT_ID/);
});
```

- [ ] **Step 6: Запустити тест і переконатися, що він падає**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/config.js'`

- [ ] **Step 7: Реалізувати `src/config.ts`**

```ts
export type Config = {
  botToken: string;
  adminChatId: number;
};

/**
 * Бот без ADMIN_CHAT_ID мовчки губив би заявки, тому падаємо на старті.
 */
export function loadConfig(env: NodeJS.ProcessEnv): Config {
  const missing: string[] = [];
  const botToken = env.BOT_TOKEN?.trim();
  const rawChatId = env.ADMIN_CHAT_ID?.trim();

  if (!botToken) missing.push('BOT_TOKEN');
  if (!rawChatId) missing.push('ADMIN_CHAT_ID');
  if (missing.length > 0) {
    throw new Error(`Не задані змінні оточення: ${missing.join(', ')}. Приклад — у .env.example`);
  }

  const adminChatId = Number(rawChatId);
  if (!Number.isInteger(adminChatId)) {
    throw new Error(`ADMIN_CHAT_ID має бути числом, отримано: ${rawChatId}`);
  }

  return { botToken: botToken!, adminChatId };
}
```

- [ ] **Step 8: Запустити тести й перевірку типів**

Run: `npm test && npm run typecheck`
Expected: 3 теста PASS, `tsc` без помилок

- [ ] **Step 9: Коміт**

```bash
git add .
git commit -m "chore: каркас проєкту та перевірка змінних оточення"
```

---

### Task 2: Тексти й клавіатури

**Files:**
- Create: `src/content.ts`, `src/keyboards.ts`
- Test: `test/content.test.ts`

**Interfaces:**
- Consumes: нічого
- Produces:
  - `content.start`, `content.pricesText`, `content.bookingPrompts`, `content.errors` — рядки
  - `content.faq: readonly { question: string; answer: string }[]` (8 елементів)
  - `content.subjects: readonly string[]` (6 елементів, як `contactSubjects` на лендінгу)
  - `CB` — константи `callback_data`; `cbFaq(i: number): string`, `cbSubject(i: number): string`
  - `menuKeyboard()`, `pricesKeyboard()`, `faqListKeyboard()`, `faqAnswerKeyboard()`, `subjectsKeyboard()`, `detailsKeyboard()`, `confirmKeyboard()`, `cancelKeyboard()` — усі повертають `InlineKeyboard`

- [ ] **Step 1: Написати падаючий тест `test/content.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content.js';
import { CB, cbFaq, cbSubject, subjectsKeyboard, faqListKeyboard } from '../src/keyboards.js';

test('вісім запитань, у кожного є відповідь', () => {
  assert.equal(content.faq.length, 8);
  for (const item of content.faq) {
    assert.ok(item.question.length > 0);
    assert.ok(item.answer.length > 20);
  }
});

test('текст цін містить усі три тарифи', () => {
  assert.match(content.pricesText, /1\u00a0600/);
  assert.match(content.pricesText, /2\u00a0000/);
  assert.match(content.pricesText, /50–60/);
});

test('стартове повідомлення згадує кризову лінію', () => {
  assert.match(content.start, /7333/);
});

test('теми запиту збігаються з лендінгом', () => {
  assert.equal(content.subjects.length, 6);
});

test('callback_data унікальні й не довші за 64 байти', () => {
  const values = [
    ...Object.values(CB),
    ...content.faq.map((_, i) => cbFaq(i)),
    ...content.subjects.map((_, i) => cbSubject(i)),
  ];
  assert.equal(new Set(values).size, values.length);
  for (const value of values) {
    assert.ok(Buffer.byteLength(value) <= 64, `задовге callback_data: ${value}`);
  }
});

test('клавіатури мають кнопку на кожен пункт', () => {
  assert.equal(faqListKeyboard().inline_keyboard.length, content.faq.length + 1);
  assert.equal(subjectsKeyboard().inline_keyboard.length, content.subjects.length + 1);
});
```

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/content.js'`

- [ ] **Step 3: Реалізувати `src/content.ts`**

Тексти скопійовані з лендінгу (`lib/site.ts`, `lib/content.ts`). Розмітка — HTML (`parse_mode: 'HTML'`).

```ts
export const TELEGRAM_HANDLE = 'Krav_Kristel';
export const CRISIS_LINE = '7333';

export const content = {
  start: [
    '<b>Вітаю!</b> Це бот психологині Крістель Кравець — гештальт-терапевтки, яка працює',
    'з розладами харчової поведінки, тривогою та прийняттям себе.',
    '',
    'Тут можна подивитися вартість сесій, знайти відповіді на поширені запитання',
    'або залишити заявку — Крістель напише вам особисто.',
    '',
    `Якщо стан гострий і потрібна негайна допомога — лінія ${CRISIS_LINE} (безкоштовно, цілодобово).`,
  ].join('\n'),

  menuTitle: 'Оберіть, що вас цікавить:',

  pricesText: [
    '<b>Вартість сесій</b>',
    '',
    '<b>Індивідуальна сесія</b> — 1\u00a0600\u00a0₴ / 50–60 хв',
    'Онлайн або офлайн, конфіденційно, можна з псевдонімом.',
    '',
    '<b>Терапія РХП</b> — 1\u00a0600\u00a0₴ / 50–60 хв',
    'Анорексія, булімія, переїдання. Гештальт і тілесний підхід,',
    'за потреби — координація з лікарем.',
    '',
    '<b>Парна сесія з батьками</b> — 2\u00a0000\u00a0₴ / сесія',
    'Спільна зустріч підлітка з батьками, відновлення діалогу в родині.',
    '',
    '<b>Оплата</b> — за добу до консультації: цей час резервується в розкладі лише для вас.',
    'Якщо плани змінилися, попередьте щонайменше за 24 години — перенесемо або скасуємо без втрат.',
  ].join('\n'),

  faqTitle: 'Поширені запитання. Оберіть те, що цікавить:',

  faq: [
    {
      question: 'З якими розладами харчової поведінки працюєте?',
      answer:
        'Я спеціалізуюся на роботі з різними типами розладів харчової поведінки: обмеження їжі, переїдання, компульсивне переїдання, цикли «переїдання–очищення», тривожне ставлення до їжі та образу тіла. Допомагаю сформувати здорові стосунки з їжею та тілом.',
    },
    {
      question: 'Який підхід використовуєте?',
      answer:
        'У своїй практиці поєдную гештальт-терапію, тілесно-орієнтований підхід і психоедукацію. Моя мета — допомогти клієнту відновити контакт із тілом, розуміння власних потреб і зменшити тривогу, пов’язану з харчуванням.',
    },
    {
      question: 'Чи співпрацюєте з лікарями та дієтологами?',
      answer:
        'Так. У випадках, коли необхідна медична або нутриціологічна підтримка, я можу координувати роботу з дієтологом або лікарем. Це допомагає забезпечити комплексний підхід і безпечне відновлення здоров’я клієнта.',
    },
    {
      question: 'Скільки триває терапія і одна сесія?',
      answer:
        'Одна онлайн-сесія триває близько 50–60 хвилин. Тривалість усієї терапії залежить від індивідуальної ситуації: для когось достатньо кількох місяців, для інших процес може бути довшим. Усе визначається спільно з клієнтом.',
    },
    {
      question: 'Чи можуть бути залучені близькі?',
      answer:
        'Так, за потреби до терапії можуть бути залучені близькі люди. Це допомагає створити систему підтримки, краще зрозуміти природу РХП та зменшити тиск і конфлікти у родині.',
    },
    {
      question: 'Чи можна консультацію онлайн?',
      answer:
        'Так, я проводжу консультації онлайн через зручні месенджери або відеозв’язок. Усі зустрічі конфіденційні, дані клієнта захищені, а за бажанням можна використовувати псевдонім. Дотримуюся етичних стандартів і гарантую конфіденційність.',
    },
    {
      question: 'Як відбувається оплата?',
      answer:
        'Оплата — за добу до консультації: так ваш час закріплюється в розкладі саме за вами. Якщо плани змінилися, просто напишіть щонайменше за 24 години — перенесемо зустріч або скасуємо без втрат. Якщо попередити пізніше, кошти не повертаються, бо ця година вже була зарезервована тільки для вас.',
    },
    {
      question: 'Чи хтось знатиме, що я в терапії?',
      answer:
        'Ні. Уся інформація про вашу участь у терапії є конфіденційною. Я не передаю дані третім особам і не зберігаю записів сесій без вашої згоди. Ви можете залишатися повністю анонімними.',
    },
  ],

  subjects: [
    'РХП / анорексія / булімія / переїдання',
    'Тривога / панічні атаки',
    'Самооцінка / прийняття себе',
    'Підліткова терапія / сесія з батьками',
    'Відносини / кордони',
    'Ще не визначилася / не визначився',
  ],

  bookingPrompts: {
    name: 'Як до вас звертатися? Можна псевдонім — це нормально.',
    subject: 'З чим хочете попрацювати?',
    details:
      'Хочете додати кілька слів про свій запит? Це не обов’язково — можна пропустити.',
    contact:
      'У вашому профілі немає @username, тож залиште, будь ласка, контакт: телефон або посилання, щоб Крістель могла відповісти.',
    confirmTitle: 'Перевірте, будь ласка, заявку:',
    sent:
      'Дякую. Заявку передано — Крістель напише вам особисто найближчим часом.\n\nЯкщо стан погіршиться раніше, є цілодобова лінія ' +
      CRISIS_LINE +
      '.',
    cancelled: 'Гаразд, заявку скасовано. Можете повернутися до неї будь-коли.',
    emptyName: 'Напишіть, будь ласка, ім’я текстом — або натисніть «Скасувати».',
  },

  fallback: [
    'Я бот і, на жаль, не читаю повідомлення — Крістель їх не побачить.',
    '',
    'Щоб вона вам відповіла, натисніть «Записатися»: кілька коротких питань, і заявка буде в неї.',
    `Можна також написати напряму: @${TELEGRAM_HANDLE}`,
  ].join('\n'),

  errors: {
    generic:
      `Щось пішло не так. Спробуйте ще раз або напишіть напряму: @${TELEGRAM_HANDLE}`,
    notDelivered: [
      'Не вдалося передати заявку автоматично — схоже, проблема на боці Telegram.',
      'Щоб ваше звернення не загубилося, надішліть його одним дотиком за посиланням нижче.',
    ].join('\n'),
    expired: 'Схоже, ця розмова вже завершилася. Натисніть /start, щоб почати спочатку.',
  },

  buttons: {
    prices: '💳 Ціни',
    faq: '❓ Питання',
    book: '📝 Записатися',
    back: '← Назад',
    faqList: '← До списку питань',
    skip: 'Пропустити',
    cancel: 'Скасувати',
    confirm: 'Надіслати заявку',
    openChat: 'Написати Крістель',
  },
} as const;
```

- [ ] **Step 4: Реалізувати `src/keyboards.ts`**

```ts
import { InlineKeyboard } from 'grammy';
import { content } from './content.js';

/** Короткі префікси: callback_data обмежене 64 байтами. */
export const CB = {
  menu: 'm',
  prices: 'p',
  faqList: 'f',
  book: 'b',
  bookSkipDetails: 'b:skip',
  bookConfirm: 'b:ok',
  bookCancel: 'b:no',
} as const;

export const cbFaq = (index: number) => `f:${index}`;
export const cbSubject = (index: number) => `b:s:${index}`;

/** Повертає індекс або null, якщо callback_data не з цього набору. */
export function parseIndex(prefix: string, data: string): number | null {
  if (!data.startsWith(`${prefix}:`)) return null;
  const index = Number(data.slice(prefix.length + 1));
  return Number.isInteger(index) ? index : null;
}

export function menuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(content.buttons.prices, CB.prices)
    .row()
    .text(content.buttons.faq, CB.faqList)
    .row()
    .text(content.buttons.book, CB.book);
}

export function pricesKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(content.buttons.book, CB.book)
    .row()
    .text(content.buttons.back, CB.menu);
}

export function faqListKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  content.faq.forEach((item, index) => keyboard.text(item.question, cbFaq(index)).row());
  return keyboard.text(content.buttons.back, CB.menu);
}

export function faqAnswerKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(content.buttons.faqList, CB.faqList)
    .row()
    .text(content.buttons.book, CB.book);
}

export function subjectsKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  content.subjects.forEach((subject, index) => keyboard.text(subject, cbSubject(index)).row());
  return keyboard.text(content.buttons.cancel, CB.bookCancel);
}

export function detailsKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(content.buttons.skip, CB.bookSkipDetails)
    .row()
    .text(content.buttons.cancel, CB.bookCancel);
}

export function confirmKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(content.buttons.confirm, CB.bookConfirm)
    .row()
    .text(content.buttons.cancel, CB.bookCancel);
}

export function cancelKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text(content.buttons.cancel, CB.bookCancel);
}
```

- [ ] **Step 5: Запустити тести**

Run: `npm test && npm run typecheck`
Expected: усі тести PASS

- [ ] **Step 6: Коміт**

```bash
git add src/content.ts src/keyboards.ts test/content.test.ts
git commit -m "feat: тексти бота та inline-клавіатури"
```

---

### Task 3: Стан діалогу запису

**Files:**
- Create: `src/booking/session.ts`
- Test: `test/session.test.ts`

**Interfaces:**
- Consumes: нічого
- Produces:
  - `type BookingStep = 'name' | 'subject' | 'details' | 'contact' | 'confirm'`
  - `type BookingSession = { step: BookingStep; name?: string; subject?: string; details?: string; contact?: string; hasUsername: boolean; updatedAt: number }`
  - `startBooking(hasUsername: boolean, now: number): BookingSession`
  - `applyName(s, name: string, now): BookingSession`
  - `applySubject(s, subject: string, now): BookingSession`
  - `applyDetails(s, details: string | null, now): BookingSession`
  - `applyContact(s, contact: string, now): BookingSession`
  - `class SessionStore { constructor(ttlMs?: number); get(userId, now): BookingSession | undefined; set(userId, s): void; delete(userId): void; sweep(now): void; size: number }`
  - `SESSION_TTL_MS`, `SWEEP_INTERVAL_MS`

- [ ] **Step 1: Написати падаючий тест `test/session.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SessionStore,
  SESSION_TTL_MS,
  applyContact,
  applyDetails,
  applyName,
  applySubject,
  startBooking,
} from '../src/booking/session.js';

test('запис починається з кроку імені', () => {
  const session = startBooking(true, 1000);
  assert.equal(session.step, 'name');
  assert.equal(session.updatedAt, 1000);
});

test('після імені й теми пропонує деталі', () => {
  let session = startBooking(true, 0);
  session = applyName(session, 'Оля', 10);
  assert.equal(session.step, 'subject');
  session = applySubject(session, 'Тривога', 20);
  assert.equal(session.step, 'details');
  assert.equal(session.name, 'Оля');
  assert.equal(session.subject, 'Тривога');
});

test('з username після деталей одразу підтвердження', () => {
  let session = applySubject(applyName(startBooking(true, 0), 'Оля', 1), 'Тривога', 2);
  session = applyDetails(session, 'Не сплю тижнями', 3);
  assert.equal(session.step, 'confirm');
  assert.equal(session.details, 'Не сплю тижнями');
});

test('без username після деталей питає контакт', () => {
  let session = applySubject(applyName(startBooking(false, 0), 'Оля', 1), 'Тривога', 2);
  session = applyDetails(session, null, 3);
  assert.equal(session.step, 'contact');
  assert.equal(session.details, undefined);
  session = applyContact(session, '+380...', 4);
  assert.equal(session.step, 'confirm');
  assert.equal(session.contact, '+380...');
});

test('пропуск деталей не зберігає тексту', () => {
  let session = applySubject(applyName(startBooking(true, 0), 'Оля', 1), 'Тривога', 2);
  session = applyDetails(session, null, 3);
  assert.equal(session.step, 'confirm');
  assert.equal(session.details, undefined);
});

test('переходи не мутують попередній стан', () => {
  const first = startBooking(true, 0);
  const second = applyName(first, 'Оля', 1);
  assert.equal(first.step, 'name');
  assert.notEqual(first, second);
});

test('сховище віддає сесію до спливання TTL', () => {
  const store = new SessionStore();
  store.set(7, startBooking(true, 0));
  assert.ok(store.get(7, SESSION_TTL_MS - 1));
});

test('сховище забуває сесію після TTL', () => {
  const store = new SessionStore();
  store.set(7, startBooking(true, 0));
  assert.equal(store.get(7, SESSION_TTL_MS + 1), undefined);
  assert.equal(store.size, 0);
});

test('sweep прибирає лише прострочені сесії', () => {
  const store = new SessionStore();
  store.set(1, startBooking(true, 0));
  store.set(2, startBooking(true, SESSION_TTL_MS));
  store.sweep(SESSION_TTL_MS + 1);
  assert.equal(store.size, 1);
  assert.ok(store.get(2, SESSION_TTL_MS + 1));
});
```

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/booking/session.js'`

- [ ] **Step 3: Реалізувати `src/booking/session.ts`**

```ts
export const SESSION_TTL_MS = 30 * 60 * 1000;
export const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

export type BookingStep = 'name' | 'subject' | 'details' | 'contact' | 'confirm';

export type BookingSession = {
  step: BookingStep;
  name?: string;
  subject?: string;
  details?: string;
  contact?: string;
  /** Якщо username є, окремий крок контакту не потрібен. */
  hasUsername: boolean;
  updatedAt: number;
};

export function startBooking(hasUsername: boolean, now: number): BookingSession {
  return { step: 'name', hasUsername, updatedAt: now };
}

export function applyName(session: BookingSession, name: string, now: number): BookingSession {
  return { ...session, name, step: 'subject', updatedAt: now };
}

export function applySubject(session: BookingSession, subject: string, now: number): BookingSession {
  return { ...session, subject, step: 'details', updatedAt: now };
}

export function applyDetails(
  session: BookingSession,
  details: string | null,
  now: number,
): BookingSession {
  const next: BookingSession = {
    ...session,
    step: session.hasUsername ? 'confirm' : 'contact',
    updatedAt: now,
  };
  if (details) next.details = details;
  return next;
}

export function applyContact(session: BookingSession, contact: string, now: number): BookingSession {
  return { ...session, contact, step: 'confirm', updatedAt: now };
}

export class SessionStore {
  readonly #sessions = new Map<number, BookingSession>();
  readonly #ttlMs: number;

  constructor(ttlMs: number = SESSION_TTL_MS) {
    this.#ttlMs = ttlMs;
  }

  get size(): number {
    return this.#sessions.size;
  }

  get(userId: number, now: number): BookingSession | undefined {
    const session = this.#sessions.get(userId);
    if (!session) return undefined;
    if (now - session.updatedAt > this.#ttlMs) {
      this.#sessions.delete(userId);
      return undefined;
    }
    return session;
  }

  set(userId: number, session: BookingSession): void {
    this.#sessions.set(userId, session);
  }

  delete(userId: number): void {
    this.#sessions.delete(userId);
  }

  sweep(now: number): void {
    for (const [userId, session] of this.#sessions) {
      if (now - session.updatedAt > this.#ttlMs) this.#sessions.delete(userId);
    }
  }
}
```

- [ ] **Step 4: Запустити тести**

Run: `npm test && npm run typecheck`
Expected: усі тести PASS

- [ ] **Step 5: Коміт**

```bash
git add src/booking/session.ts test/session.test.ts
git commit -m "feat: машина станів запису та сховище сесій із TTL"
```

---

### Task 4: Заявка та її форматування

**Files:**
- Create: `src/booking/application.ts`
- Test: `test/application.test.ts`

**Interfaces:**
- Consumes: `BookingSession` із `src/booking/session.js`
- Produces:
  - `type Applicant = { id: number; username?: string }`
  - `type Application = { name: string; subject: string; details?: string; contact?: string; applicant: Applicant; submittedAt: Date }`
  - `buildApplication(session: BookingSession, applicant: Applicant, submittedAt: Date): Application`
  - `formatForAdmin(app: Application): string` — HTML
  - `formatForUser(app: Application): string` — HTML, попередній перегляд перед підтвердженням
  - `formatFallbackMessage(app: Application): string` — простий текст для ручного надсилання
  - `escapeHtml(value: string): string`

- [ ] **Step 1: Написати падаючий тест `test/application.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildApplication,
  escapeHtml,
  formatFallbackMessage,
  formatForAdmin,
  formatForUser,
} from '../src/booking/application.js';
import { applyContact, applyDetails, applyName, applySubject, startBooking } from '../src/booking/session.js';

const submittedAt = new Date('2026-08-24T18:30:00Z');

function sessionWithUsername() {
  return applyDetails(
    applySubject(applyName(startBooking(true, 0), 'Оля', 1), 'Тривога / панічні атаки', 2),
    'Не сплю тижнями',
    3,
  );
}

test('заявка з username містить посилання на профіль', () => {
  const app = buildApplication(sessionWithUsername(), { id: 555, username: 'olya' }, submittedAt);
  const text = formatForAdmin(app);
  assert.match(text, /Оля/);
  assert.match(text, /Тривога \/ панічні атаки/);
  assert.match(text, /Не сплю тижнями/);
  assert.match(text, /@olya/);
  assert.match(text, /tg:\/\/user\?id=555/);
});

test('без username у заявці є введений контакт і посилання за id', () => {
  const session = applyContact(
    applyDetails(applySubject(applyName(startBooking(false, 0), 'Х', 1), 'РХП', 2), null, 3),
    '+380671234567',
    4,
  );
  const text = formatForAdmin(buildApplication(session, { id: 777 }, submittedAt));
  assert.match(text, /\+380671234567/);
  assert.match(text, /tg:\/\/user\?id=777/);
  assert.doesNotMatch(text, /undefined/);
});

test('неповна сесія — це помилка програміста, а не мовчазна заявка', () => {
  assert.throws(() => buildApplication(startBooking(true, 0), { id: 1 }, submittedAt), /ім’я|тем/i);
});

test('HTML у введених даних екранується', () => {
  assert.equal(escapeHtml('<b>&"'), '&lt;b&gt;&amp;&quot;');
  const session = applyDetails(
    applySubject(applyName(startBooking(true, 0), '<script>', 1), 'РХП', 2),
    'a & b',
    3,
  );
  const text = formatForAdmin(buildApplication(session, { id: 1, username: 'x' }, submittedAt));
  assert.match(text, /&lt;script&gt;/);
  assert.doesNotMatch(text, /<script>/);
});

test('попередній перегляд показує ті самі поля без службових посилань', () => {
  const app = buildApplication(sessionWithUsername(), { id: 555, username: 'olya' }, submittedAt);
  const preview = formatForUser(app);
  assert.match(preview, /Оля/);
  assert.doesNotMatch(preview, /tg:\/\/user/);
});

test('запасне повідомлення — простий текст без HTML-тегів', () => {
  const app = buildApplication(sessionWithUsername(), { id: 555, username: 'olya' }, submittedAt);
  const fallback = formatFallbackMessage(app);
  assert.match(fallback, /Оля/);
  assert.doesNotMatch(fallback, /<[a-z]/i);
});
```

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/booking/application.js'`

- [ ] **Step 3: Реалізувати `src/booking/application.ts`**

```ts
import type { BookingSession } from './session.js';

export type Applicant = {
  id: number;
  username?: string;
};

export type Application = {
  name: string;
  subject: string;
  details?: string;
  contact?: string;
  applicant: Applicant;
  submittedAt: Date;
};

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function buildApplication(
  session: BookingSession,
  applicant: Applicant,
  submittedAt: Date,
): Application {
  if (!session.name || !session.subject) {
    throw new Error('Заявка неповна: бракує імені або теми запиту');
  }

  const application: Application = {
    name: session.name,
    subject: session.subject,
    applicant,
    submittedAt,
  };
  if (session.details) application.details = session.details;
  if (session.contact) application.contact = session.contact;
  return application;
}

const timeFormatter = new Intl.DateTimeFormat('uk-UA', {
  timeZone: 'Europe/Kyiv',
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatForAdmin(app: Application): string {
  const contactLine = app.applicant.username
    ? `@${escapeHtml(app.applicant.username)}`
    : escapeHtml(app.contact ?? 'не вказано');

  const lines = [
    '<b>Нова заявка з бота</b>',
    '',
    `<b>Ім’я:</b> ${escapeHtml(app.name)}`,
    `<b>Запит:</b> ${escapeHtml(app.subject)}`,
  ];
  if (app.details) lines.push(`<b>Деталі:</b> ${escapeHtml(app.details)}`);
  lines.push(
    `<b>Контакт:</b> ${contactLine}`,
    `<a href="tg://user?id=${app.applicant.id}">Відкрити чат</a>`,
    '',
    `<i>${timeFormatter.format(app.submittedAt)}</i>`,
  );
  return lines.join('\n');
}

export function formatForUser(app: Application): string {
  const lines = [`<b>Ім’я:</b> ${escapeHtml(app.name)}`, `<b>Запит:</b> ${escapeHtml(app.subject)}`];
  if (app.details) lines.push(`<b>Деталі:</b> ${escapeHtml(app.details)}`);
  if (app.contact) lines.push(`<b>Контакт:</b> ${escapeHtml(app.contact)}`);
  return lines.join('\n');
}

/** Текст для ручного надсилання, якщо автоматична доставка не спрацювала. */
export function formatFallbackMessage(app: Application): string {
  const lines = [`Заявка з бота.`, `Ім’я: ${app.name}`, `Запит: ${app.subject}`];
  if (app.details) lines.push(`Деталі: ${app.details}`);
  if (app.contact) lines.push(`Контакт: ${app.contact}`);
  return lines.join('\n');
}
```

- [ ] **Step 4: Запустити тести**

Run: `npm test && npm run typecheck`
Expected: усі тести PASS

- [ ] **Step 5: Коміт**

```bash
git add src/booking/application.ts test/application.test.ts
git commit -m "feat: модель заявки та її форматування"
```

---

### Task 5: Доставка заявки з повторами

**Files:**
- Create: `src/notify.ts`
- Test: `test/notify.test.ts`

**Interfaces:**
- Consumes: нічого (навмисно не залежить від grammY, щоб тестуватися без мережі)
- Produces: `sendWithRetry(send: () => Promise<unknown>, options?: { attempts?: number; delayMs?: number; sleep?: (ms: number) => Promise<void>; onError?: (error: unknown, attempt: number) => void }): Promise<boolean>`

- [ ] **Step 1: Написати падаючий тест `test/notify.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendWithRetry } from '../src/notify.js';

const noSleep = async () => {};

test('успіх із першої спроби — один виклик', async () => {
  let calls = 0;
  const ok = await sendWithRetry(
    async () => {
      calls += 1;
    },
    { sleep: noSleep },
  );
  assert.equal(ok, true);
  assert.equal(calls, 1);
});

test('повторює після збою і повертає true', async () => {
  let calls = 0;
  const ok = await sendWithRetry(
    async () => {
      calls += 1;
      if (calls < 3) throw new Error('network');
    },
    { sleep: noSleep },
  );
  assert.equal(ok, true);
  assert.equal(calls, 3);
});

test('після трьох невдач повертає false, а не кидає', async () => {
  let calls = 0;
  const errors: number[] = [];
  const ok = await sendWithRetry(
    async () => {
      calls += 1;
      throw new Error('down');
    },
    { sleep: noSleep, onError: (_error, attempt) => errors.push(attempt) },
  );
  assert.equal(ok, false);
  assert.equal(calls, 3);
  assert.deepEqual(errors, [1, 2, 3]);
});

test('затримка зростає між спробами', async () => {
  const delays: number[] = [];
  await sendWithRetry(
    async () => {
      throw new Error('down');
    },
    {
      delayMs: 100,
      sleep: async (ms) => {
        delays.push(ms);
      },
    },
  );
  assert.deepEqual(delays, [100, 200]);
});
```

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/notify.js'`

- [ ] **Step 3: Реалізувати `src/notify.ts`**

```ts
export type RetryOptions = {
  attempts?: number;
  delayMs?: number;
  sleep?: (ms: number) => Promise<void>;
  onError?: (error: unknown, attempt: number) => void;
};

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Повертає false замість винятку: втрачену заявку користувач має побачити
 * як зрозуміле повідомлення із запасним посиланням, а не як помилку.
 */
export async function sendWithRetry(
  send: () => Promise<unknown>,
  options: RetryOptions = {},
): Promise<boolean> {
  const { attempts = 3, delayMs = 1000, sleep = defaultSleep, onError } = options;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await send();
      return true;
    } catch (error) {
      onError?.(error, attempt);
      if (attempt < attempts) await sleep(delayMs * attempt);
    }
  }
  return false;
}
```

- [ ] **Step 4: Запустити тести**

Run: `npm test && npm run typecheck`
Expected: усі тести PASS

- [ ] **Step 5: Коміт**

```bash
git add src/notify.ts test/notify.test.ts
git commit -m "feat: доставка заявки з повторними спробами"
```

---

### Task 6: Бот, меню, ціни, питання і вільний текст

**Files:**
- Create: `src/handlers/menu.ts`, `src/handlers/prices.ts`, `src/handlers/faq.ts`, `src/handlers/fallback.ts`, `src/index.ts`
- Test: перевірка вручну в Telegram (хендлери — тонкі обгортки над уже покритою логікою)

**Interfaces:**
- Consumes: `content`, клавіатури з `src/keyboards.js`, `loadConfig`
- Produces:
  - `registerMenu(bot: Bot)`, `registerPrices(bot: Bot)`, `registerFaq(bot: Bot)`, `registerFallback(bot: Bot)` — кожна реєструє свої хендлери
  - `showMenu(ctx: Context, mode: 'send' | 'edit'): Promise<void>` із `src/handlers/menu.js`

- [ ] **Step 1: Реалізувати `src/handlers/menu.ts`**

```ts
import type { Bot, Context } from 'grammy';
import { content } from '../content.js';
import { CB, menuKeyboard } from '../keyboards.js';

export async function showMenu(ctx: Context, mode: 'send' | 'edit'): Promise<void> {
  const text = `${content.start}\n\n${content.menuTitle}`;
  const options = { parse_mode: 'HTML', reply_markup: menuKeyboard() } as const;

  if (mode === 'edit' && ctx.callbackQuery?.message) {
    await ctx.editMessageText(text, options);
    return;
  }
  await ctx.reply(text, options);
}

export function registerMenu(bot: Bot): void {
  // /start може прийти з payload (?start=site) — payload ігноруємо.
  bot.command('start', (ctx) => showMenu(ctx, 'send'));
  bot.callbackQuery(CB.menu, async (ctx) => {
    await ctx.answerCallbackQuery();
    await showMenu(ctx, 'edit');
  });
}
```

- [ ] **Step 2: Реалізувати `src/handlers/prices.ts`**

```ts
import type { Bot } from 'grammy';
import { content } from '../content.js';
import { CB, pricesKeyboard } from '../keyboards.js';

export function registerPrices(bot: Bot): void {
  bot.callbackQuery(CB.prices, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(content.pricesText, {
      parse_mode: 'HTML',
      reply_markup: pricesKeyboard(),
    });
  });
}
```

- [ ] **Step 3: Реалізувати `src/handlers/faq.ts`**

```ts
import type { Bot } from 'grammy';
import { content } from '../content.js';
import { CB, faqAnswerKeyboard, faqListKeyboard, parseIndex } from '../keyboards.js';

export function registerFaq(bot: Bot): void {
  bot.callbackQuery(CB.faqList, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(content.faqTitle, {
      parse_mode: 'HTML',
      reply_markup: faqListKeyboard(),
    });
  });

  bot.callbackQuery(/^f:\d+$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const index = parseIndex('f', ctx.callbackQuery.data);
    const item = index === null ? undefined : content.faq[index];
    if (!item) {
      await ctx.editMessageText(content.faqTitle, {
        parse_mode: 'HTML',
        reply_markup: faqListKeyboard(),
      });
      return;
    }
    await ctx.editMessageText(`<b>${item.question}</b>\n\n${item.answer}`, {
      parse_mode: 'HTML',
      reply_markup: faqAnswerKeyboard(),
    });
  });
}
```

- [ ] **Step 4: Створити спільне сховище сесій `src/booking/store.ts`**

```ts
import { SessionStore } from './session.js';

/** Один екземпляр на процес: і запис, і fallback дивляться в те саме сховище. */
export const sessions = new SessionStore();
```

- [ ] **Step 5: Реалізувати `src/handlers/fallback.ts`**

```ts
import type { Bot } from 'grammy';
import { content } from '../content.js';
import { menuKeyboard } from '../keyboards.js';
import { sessions } from '../booking/store.js';

/**
 * Реєструється останнім: спрацьовує лише на текст, який не підхопив
 * покроковий запис. Текст користувача нікуди не пересилаємо.
 */
export function registerFallback(bot: Bot): void {
  bot.on('message:text', async (ctx) => {
    if (ctx.from && sessions.get(ctx.from.id, Date.now())) return;
    await ctx.reply(content.fallback, { parse_mode: 'HTML', reply_markup: menuKeyboard() });
  });
}
```

- [ ] **Step 6: Реалізувати `src/index.ts`**

```ts
import 'dotenv/config';
import { Bot, GrammyError, HttpError } from 'grammy';
import { loadConfig } from './config.js';
import { content } from './content.js';
import { sessions } from './booking/store.js';
import { SWEEP_INTERVAL_MS } from './booking/session.js';
import { registerFallback } from './handlers/fallback.js';
import { registerFaq } from './handlers/faq.js';
import { registerMenu } from './handlers/menu.js';
import { registerPrices } from './handlers/prices.js';

const config = loadConfig(process.env);
const bot = new Bot(config.botToken);

registerMenu(bot);
registerPrices(bot);
registerFaq(bot);
registerFallback(bot);

bot.catch(async ({ ctx, error }) => {
  const reason =
    error instanceof GrammyError
      ? `Telegram API: ${error.description}`
      : error instanceof HttpError
        ? `мережа: ${error.message}`
        : error;
  console.error(`Помилка обробки оновлення від ${ctx.from?.id ?? 'невідомо'}:`, reason);
  try {
    await ctx.reply(content.errors.generic);
  } catch {
    // Якщо не вдалося навіть відповісти — далі робити нічого.
  }
});

const sweepTimer = setInterval(() => sessions.sweep(Date.now()), SWEEP_INTERVAL_MS);
sweepTimer.unref();

async function shutdown(signal: string): Promise<void> {
  console.info(`Отримано ${signal}, зупиняюся`);
  clearInterval(sweepTimer);
  await bot.stop();
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

console.info('Бот запускається');
await bot.start({ onStart: (me) => console.info(`Готовий: @${me.username}`) });
```

Порядок реєстрації важливий: `registerFallback` — останній, інакше він перехопить текст, призначений для кроків запису (додається в наступній задачі).

- [ ] **Step 7: Перевірити збірку і типи**

Run: `npm run typecheck && npm run build`
Expected: без помилок

- [ ] **Step 8: Перевірити вручну в Telegram**

Створити бота через [@BotFather](https://t.me/BotFather), дізнатися свій chat id через `@userinfobot`, покласти обидва значення в `.env`, запустити `npm run dev` і пройти чекліст:

1. `/start` — привітання, три кнопки, згадка 7333.
2. «Ціни» — три тарифи й правила оплати; «Назад» повертає в меню.
3. «Питання» — вісім кнопок; відповідь замінює повідомлення; «До списку питань» працює.
4. Надіслати довільний текст — бот відповідає м'яко й показує меню.
5. Зупинити процес через Ctrl+C — виходить без помилок.

- [ ] **Step 9: Коміт**

```bash
git add src/index.ts src/handlers src/booking/store.ts
git commit -m "feat: запуск бота, меню, ціни та поширені запитання"
```

---

### Task 7: Сценарій запису та документація

**Files:**
- Create: `src/handlers/booking.ts`, `README.md`
- Modify: `src/index.ts` (реєстрація `registerBooking` перед `registerFallback`)

**Interfaces:**
- Consumes: `sessions`, переходи станів із `session.js`, `buildApplication`/`formatForAdmin`/`formatForUser`/`formatFallbackMessage`, `sendWithRetry`, клавіатури
- Produces: `registerBooking(bot: Bot, adminChatId: number): void`

- [ ] **Step 1: Реалізувати `src/handlers/booking.ts`**

```ts
import { Bot, InlineKeyboard } from 'grammy';
import { content, TELEGRAM_HANDLE } from '../content.js';
import {
  CB,
  cancelKeyboard,
  confirmKeyboard,
  detailsKeyboard,
  menuKeyboard,
  parseIndex,
  subjectsKeyboard,
} from '../keyboards.js';
import { sessions } from '../booking/store.js';
import {
  applyContact,
  applyDetails,
  applyName,
  applySubject,
  startBooking,
  type BookingSession,
} from '../booking/session.js';
import {
  buildApplication,
  formatFallbackMessage,
  formatForAdmin,
  formatForUser,
} from '../booking/application.js';
import { sendWithRetry } from '../notify.js';

const HTML = { parse_mode: 'HTML' } as const;

function manualLink(text: string): InlineKeyboard {
  const url = `https://t.me/${TELEGRAM_HANDLE}?text=${encodeURIComponent(text)}`;
  return new InlineKeyboard().url(content.buttons.openChat, url);
}

export function registerBooking(bot: Bot, adminChatId: number): void {
  bot.callbackQuery(CB.book, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;
    sessions.set(ctx.from.id, startBooking(Boolean(ctx.from.username), Date.now()));
    await ctx.editMessageText(content.bookingPrompts.name, {
      ...HTML,
      reply_markup: cancelKeyboard(),
    });
  });

  bot.callbackQuery(CB.bookCancel, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (ctx.from) sessions.delete(ctx.from.id);
    await ctx.editMessageText(content.bookingPrompts.cancelled, {
      ...HTML,
      reply_markup: menuKeyboard(),
    });
  });

  bot.callbackQuery(/^b:s:\d+$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;
    const session = sessions.get(ctx.from.id, Date.now());
    if (!session || session.step !== 'subject') {
      await ctx.editMessageText(content.errors.expired, { reply_markup: menuKeyboard() });
      return;
    }
    const index = parseIndex('b:s', ctx.callbackQuery.data);
    const subject = index === null ? undefined : content.subjects[index];
    if (!subject) return;

    sessions.set(ctx.from.id, applySubject(session, subject, Date.now()));
    await ctx.editMessageText(content.bookingPrompts.details, {
      ...HTML,
      reply_markup: detailsKeyboard(),
    });
  });

  bot.callbackQuery(CB.bookSkipDetails, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;
    const session = sessions.get(ctx.from.id, Date.now());
    if (!session || session.step !== 'details') {
      await ctx.editMessageText(content.errors.expired, { reply_markup: menuKeyboard() });
      return;
    }
    const next = applyDetails(session, null, Date.now());
    sessions.set(ctx.from.id, next);
    await ctx.editMessageText(promptFor(next, ctx.from.id, ctx.from.username), {
      ...HTML,
      reply_markup: next.step === 'confirm' ? confirmKeyboard() : cancelKeyboard(),
    });
  });

  bot.callbackQuery(CB.bookConfirm, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;
    const session = sessions.get(ctx.from.id, Date.now());
    if (!session || session.step !== 'confirm') {
      await ctx.editMessageText(content.errors.expired, { reply_markup: menuKeyboard() });
      return;
    }

    const applicant = ctx.from.username
      ? { id: ctx.from.id, username: ctx.from.username }
      : { id: ctx.from.id };
    const application = buildApplication(session, applicant, new Date());
    sessions.delete(ctx.from.id);

    const delivered = await sendWithRetry(
      () => ctx.api.sendMessage(adminChatId, formatForAdmin(application), HTML),
      {
        onError: (error, attempt) =>
          console.error(`Спроба ${attempt} надіслати заявку не вдалася:`, error),
      },
    );

    if (delivered) {
      await ctx.editMessageText(content.bookingPrompts.sent, {
        ...HTML,
        reply_markup: menuKeyboard(),
      });
      return;
    }

    await ctx.editMessageText(content.errors.notDelivered, {
      ...HTML,
      reply_markup: manualLink(formatFallbackMessage(application)),
    });
  });

  // Текстові кроки: ім'я, деталі, контакт.
  bot.on('message:text', async (ctx, next) => {
    if (!ctx.from) return next();
    const session = sessions.get(ctx.from.id, Date.now());
    if (!session) return next();

    const text = ctx.message.text.trim();
    if (!text) {
      await ctx.reply(content.bookingPrompts.emptyName, { reply_markup: cancelKeyboard() });
      return;
    }

    const now = Date.now();
    let updated: BookingSession;
    if (session.step === 'name') updated = applyName(session, text, now);
    else if (session.step === 'details') updated = applyDetails(session, text, now);
    else if (session.step === 'contact') updated = applyContact(session, text, now);
    else return next();

    sessions.set(ctx.from.id, updated);
    await ctx.reply(promptFor(updated, ctx.from.id, ctx.from.username), {
      ...HTML,
      reply_markup: keyboardFor(updated),
    });
  });
}

function promptFor(session: BookingSession, userId: number, username?: string): string {
  switch (session.step) {
    case 'subject':
      return content.bookingPrompts.subject;
    case 'details':
      return content.bookingPrompts.details;
    case 'contact':
      return content.bookingPrompts.contact;
    case 'confirm': {
      const applicant = username ? { id: userId, username } : { id: userId };
      const preview = formatForUser(buildApplication(session, applicant, new Date()));
      return `${content.bookingPrompts.confirmTitle}\n\n${preview}`;
    }
    default:
      return content.bookingPrompts.name;
  }
}

function keyboardFor(session: BookingSession): InlineKeyboard {
  if (session.step === 'confirm') return confirmKeyboard();
  if (session.step === 'subject') return subjectsKeyboard();
  if (session.step === 'details') return detailsKeyboard();
  return cancelKeyboard();
}
```

- [ ] **Step 2: Підключити запис у `src/index.ts`**

Додати імпорт і виклик перед `registerFallback(bot)`:

```ts
import { registerBooking } from './handlers/booking.js';

registerMenu(bot);
registerPrices(bot);
registerFaq(bot);
registerBooking(bot, config.adminChatId);
registerFallback(bot);
```

- [ ] **Step 3: Перевірити типи, тести й збірку**

Run: `npm test && npm run typecheck && npm run build`
Expected: усі тести PASS, збірка без помилок

- [ ] **Step 4: Перевірити сценарій запису вручну**

Запустити `npm run dev` і пройти чекліст:

1. «Записатися» → ім'я → тема → деталі → підтвердження; заявка приходить у чат адміністратора з робочим посиланням «Відкрити чат».
2. «Пропустити» на кроці деталей — у заявці немає порожнього рядка «Деталі».
3. «Скасувати» на кожному кроці повертає меню й очищає сесію.
4. Акаунт без `@username` (можна тимчасово прибрати username у налаштуваннях Telegram) — бот питає контакт, і той потрапляє в заявку.
5. Тимчасово вказати неправильний `ADMIN_CHAT_ID` — після підтвердження бот показує запасне посилання з текстом заявки; повернути правильне значення.
6. Під час запису надіслати текст, потім `/start` — меню відкривається, стан не ламається.

- [ ] **Step 5: Написати `README.md`**

````markdown
# Бот Крістель Кравець

Telegram-бот психологині: ціни, поширені запитання, заявка на консультацію.
Заявка надходить у особистий чат — відповідає Крістель особисто, не бот.

## Стек

TypeScript, [grammY](https://grammy.dev/), long polling. Без бази даних:
стан діалогу живе в пам'яті процесу 30 хвилин, заявка одразу пересилається
й далі не зберігається.

## Запуск локально

```bash
npm install
cp .env.example .env   # BOT_TOKEN від @BotFather, ADMIN_CHAT_ID від @userinfobot
npm run dev
```

## Скрипти

| Команда | Що робить |
| --- | --- |
| `npm run dev` | Дев-режим із перезапуском |
| `npm run build` | Компіляція в `dist/` |
| `npm start` | Запуск зібраного бота |
| `npm test` | Тести (`node:test`) |
| `npm run typecheck` | Перевірка типів |

## Змінні оточення

| Змінна | Опис |
| --- | --- |
| `BOT_TOKEN` | Токен від @BotFather |
| `ADMIN_CHAT_ID` | Чат, куди надходять заявки |

Обидві обов'язкові: без них бот не стартує.

## Структура

```
src/
  config.ts          перевірка змінних оточення
  content.ts         усі тексти
  keyboards.ts       inline-клавіатури та callback_data
  notify.ts          надсилання з повторами
  booking/           стан діалогу та модель заявки
  handlers/          меню, ціни, питання, запис, вільний текст
```

## Деплой на Railway

1. New Project → Deploy from GitHub repo.
2. Variables: `BOT_TOKEN`, `ADMIN_CHAT_ID`.
3. Build `npm ci && npm run build`, Start `npm start`.
4. Один інстанс: два процеси з тим самим токеном конфліктують у polling.

## Ручна перевірка перед релізом

1. `/start` — меню і згадка кризової лінії 7333.
2. Ціни — три тарифи, правила оплати, «Назад».
3. Питання — вісім запитань, відповідь, повернення до списку.
4. Запис — повний шлях; заявка приходить із робочим посиланням на чат.
5. Пропуск деталей і скасування на кожному кроці.
6. Вільний текст поза сценарієм — м'яка відповідь із меню.
````

- [ ] **Step 6: Коміт**

```bash
git add src/handlers/booking.ts src/index.ts README.md
git commit -m "feat: сценарій запису на консультацію та документація"
```

---

## Після плану

Перенести специфікацію `docs/superpowers/specs/2026-08-24-telegram-bot-design.md` і цей план у репозиторій бота (`docs/`), щоб історія рішень жила поруч із кодом.

Окремою роботою в репозиторії лендінгу: перевести кнопки з `t.me/Krav_Kristel` на `t.me/<bot_username>?start=site`.
