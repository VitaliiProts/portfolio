const STORAGE_KEY = 'psykristel:visitor-id';

function generate(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function visitorId(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;

    const fresh = generate();
    localStorage.setItem(STORAGE_KEY, fresh);

    return fresh;
  } catch {
    return undefined;
  }
}
