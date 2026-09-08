import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'legacy/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      /**
       * З появою app/[slug] правило вважає будь-який односегментний шлях
       * сторінкою цього маршруту і хибно вимагає <Link> для навмисних <a> на
       * секційні rewrite-адреси (/pricing, /contact тощо): воно не знає, що
       * dynamicParams = false обмежує маршрут slug-ами тем.
       */
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];

export default config;
