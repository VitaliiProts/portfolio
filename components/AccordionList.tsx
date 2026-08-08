import type { Accordion } from '@/lib/content';

/**
 * Нативний `details/summary` — доступний з клавіатури й розкривається без JS,
 * тож секція лишається серверним компонентом.
 */
export function AccordionList({
  items,
  defaultOpenFirst = false,
}: {
  items: readonly Accordion[];
  defaultOpenFirst?: boolean;
}) {
  return (
    <div className="acc">
      {items.map((item, index) => (
        <details key={item.question} open={defaultOpenFirst && index === 0}>
          <summary>{item.question}</summary>
          <div className="panel">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
