import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'legacy/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    /**
     * З появою app/[slug] правило вважає будь-який односегментний шлях
     * сторінкою цього маршруту і хибно вимагає <Link> для навмисних <a> на
     * секційні rewrite-адреси (/pricing, /contact, /privacy): воно не знає, що
     * dynamicParams = false обмежує маршрут slug-ами тем. Вимикаємо точково —
     * для решти коду правило має й далі ловити справжні повні перезавантаження.
     */
    // Квадратні дужки в glob — це набір символів, тому шлях до [slug] задаємо через **.
    files: ['app/tests/**/page.tsx', 'components/Footer.tsx', 'components/StickyCta.tsx'],
    rules: { '@next/next/no-html-link-for-pages': 'off' },
  },
];

export default config;
