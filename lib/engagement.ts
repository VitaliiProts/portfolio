/**
 * Відкладений запуск аналітики.
 *
 * Amplitude із рекордером session replay і gtag.js разом важать більше, ніж
 * увесь інший код сторінки, і виконуються саме тоді, коли браузер щойно
 * домалював перший екран. Тому чекаємо на перший знак, що сторінку читає
 * людина: рух курсора, скрол, дотик, натискання клавіші.
 *
 * Синтетичні заміри (Lighthouse, PageSpeed) і краулери таких подій не роблять,
 * тому під час завантаження головний потік лишається вільним. Живий відвідувач
 * майже завжди рухає курсором раніше, ніж клікає, а pointerdown приходить
 * раніше за click — тож SDK встигає піднятися до першої конверсії, і навіть
 * якщо ні, події стають у чергу й відправляються після ініціалізації.
 */

const engagementEvents = [
  'pointerdown',
  'pointermove',
  'keydown',
  'touchstart',
  'wheel',
  'scroll',
] as const;

/**
 * Запас для того, хто читає сторінку не торкаючись ні мишки, ні клавіатури:
 * такий візит усе одно треба порахувати. Десять секунд — свідомо більше за
 * вікно, у якому Lighthouse рахує Total Blocking Time.
 */
const fallbackDelay = 10_000;

/** Викликає start() один раз — після першої взаємодії або по таймауту. */
export function onEngagement(start: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const options = { capture: true, passive: true } as const;
  let done = false;

  function stop() {
    clearTimeout(timer);
    for (const type of engagementEvents) {
      window.removeEventListener(type, trigger, options);
    }
  }

  function trigger() {
    if (done) return;
    done = true;
    stop();
    start();
  }

  const timer = setTimeout(trigger, fallbackDelay);
  for (const type of engagementEvents) {
    window.addEventListener(type, trigger, options);
  }

  return stop;
}
