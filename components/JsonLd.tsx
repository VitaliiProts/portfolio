import { buildJsonLd } from '@/lib/jsonLd';

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      // Дані статичні й формуються на сервері з локального конфігу.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
    />
  );
}
