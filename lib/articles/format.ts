/**
 * Дата для читача. Формат розкладаємо через Intl, а не руками: назви місяців
 * в українській тут у родовому відмінку («28 вересня»), і власний список
 * рано чи пізно розійшовся б із цим.
 */
export function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${iso}T00:00:00Z`));
}
