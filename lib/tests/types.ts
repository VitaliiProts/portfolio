/**
 * Модель психологічного тесту. Сім методик рахуються по-різному, тому рушій
 * описовий: файл тесту задає питання, шкали й діапазони, а логіка підрахунку
 * живе в одному місці — `scoring.ts`.
 */

export type Choice = { label: string; value: number };

export type Question = {
  text: string;
  /** Пояснення дрібним шрифтом під питанням. */
  hint?: string;
  /** Власні варіанти відповідей. Якщо немає — беруться спільні для тесту. */
  choices?: readonly Choice[];
  /** Зворотний підрахунок: `min + max - value`. */
  reverse?: boolean;
  /**
   * Питання поза балом, яке впливає на результат:
   * `crisis` — думки про самоушкодження, `behavior` — поведінкові маркери РХП.
   */
  flag?: 'crisis' | 'behavior';
};

/** Тон діапазону задає колір і тональність тексту на екрані результату. */
export type BandTone = 'calm' | 'watch' | 'alert';

export type Band = {
  id: string;
  /** Верхня межа включно. Останній діапазон має `Infinity`. */
  max: number;
  label: string;
  tone: BandTone;
  text: string;
};

export type Subscale = {
  id: string;
  title: string;
  /** Номери питань, починаючи з 1. */
  items: readonly number[];
  /** `sum` — сума балів, `mean` — середнє по пунктах (ECR-R). */
  mode: 'sum' | 'mean';
  /** Множник підсумку: 2 для DASS-21, 1 для решти. */
  factor?: number;
  bands: readonly Band[];
};

export type QuadrantKey = 'lowLow' | 'highLow' | 'lowHigh' | 'highHigh';

/** Тип прив'язаності за двома вимірами ECR-R. */
export type QuadrantRule = {
  threshold: number;
  anxietyScaleId: string;
  avoidanceScaleId: string;
  styles: Record<QuadrantKey, { label: string; text: string }>;
};

export type TestDefinition = {
  slug: string;
  /** H1 сторінки й назва картки на хабі. */
  title: string;
  /** Один рядок про суть тесту — для картки на хабі. */
  summary: string;
  /** Методика, автори, рік. */
  source: string;
  metaTitle: string;
  metaDescription: string;
  /** Абзаци інтро; рендеряться на сервері, тому їх бачить пошук. */
  intro: readonly string[];
  /** Інструкція над питаннями. */
  instruction: string;
  estimatedMinutes: number;
  /** Спільні варіанти відповідей, якщо у питання немає власних. */
  choices?: readonly Choice[];
  questions: readonly Question[];
  subscales: readonly Subscale[];
  quadrant?: QuadrantRule;
  /** Текст блоку поведінкових маркерів (питання з `flag: 'behavior'`). */
  behaviorNote?: string;
  /** Показувати кризовий блок, коли результат потрапив у найтяжчий діапазон. */
  crisisOnAlert?: boolean;
};

export type ScaleResult = {
  id: string;
  title: string;
  score: number;
  min: number;
  max: number;
  band: Band;
  /** Межі діапазонів для смужки-шкали. */
  segments: readonly { id: string; label: string; tone: BandTone; from: number; to: number }[];
};

export type TestResult = {
  scales: readonly ScaleResult[];
  /** Спрацював кризовий маркер — показуємо блок із лінією підтримки. */
  crisis: boolean;
  /** Спрацював хоча б один поведінковий маркер. */
  behavior: boolean;
  style?: { label: string; text: string };
};
