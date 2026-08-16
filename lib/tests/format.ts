/**
 * Дрібні утиліти окремо від реєстру тестів: клієнтські компоненти імпортують
 * саме їх, інакше в бандл кожної сторінки потрапили б визначення всіх семи
 * тестів разом із питаннями.
 */

export const testsHubPath = '/tests';

export function testPath(slug: string): string {
  return `${testsHubPath}/${slug}`;
}

/** «21 питання», але «7 питань» — інакше підпис під карткою читається кострубато. */
export function questionsLabel(count: number): string {
  const tail = count % 100;
  const last = count % 10;
  const plural =
    tail >= 11 && tail <= 14 ? 'питань' : last >= 1 && last <= 4 ? 'питання' : 'питань';

  return `${count} ${plural}`;
}
