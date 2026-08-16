import type { Choice } from './types';

/** Спільна шкала частоти GAD-7 і PHQ-9. */
export const frequencyChoices: readonly Choice[] = [
  { label: 'Зовсім ні', value: 0 },
  { label: 'Кілька днів', value: 1 },
  { label: 'Більше половини днів', value: 2 },
  { label: 'Майже щодня', value: 3 },
];
