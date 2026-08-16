export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Дані статичні й формуються на сервері з локального конфігу.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
