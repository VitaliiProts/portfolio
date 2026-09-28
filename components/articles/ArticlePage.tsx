import { Breadcrumbs, type Crumb } from '@/components/Breadcrumbs';
import { Faq } from '@/components/Faq';
import { TopicTests } from '@/components/topics/TopicTests';
import { TopicToc } from '@/components/topics/TopicToc';
import { articlePath, articlesHubPath, type ArticleDefinition } from '@/lib/articles';
import shared from '@/components/topics/TopicPage.module.css';
import { ArticleBody } from './ArticleBody';
import { ArticleCta } from './ArticleCta';
import { ArticleMeta } from './ArticleMeta';
import { ArticleRelated } from './ArticleRelated';

function trailFor(article: ArticleDefinition): readonly Crumb[] {
  return [
    { name: 'Статті', path: articlesHubPath },
    { name: article.h1, path: articlePath(article.slug) },
  ];
}

/**
 * Блоку цін і відгуків тут навмисно немає: стаття відповідає на питання
 * читача, який ще не обирає фахівця. Комерційну частину доносять секція
 * «Як влаштована робота зі мною» всередині тексту й блок CTA наприкінці.
 */
export function ArticlePage({ article }: { article: ArticleDefinition }) {
  return (
    <>
      <article className={shared.page} aria-labelledby="article-title">
        <div className={`wrap ${shared.inner}`}>
          <header>
            <Breadcrumbs trail={trailFor(article)} />

            <h1 id="article-title" className={shared.title}>
              {article.h1}
              <span className="dot">.</span>
            </h1>

            <p className={`lead ${shared.lead}`}>{article.lead}</p>
            <ArticleMeta updatedAt={article.updatedAt} />
          </header>

          <TopicToc sections={article.sections} />
          <ArticleBody sections={article.sections} />
          <ArticleRelated article={article} />
          <TopicTests slugs={article.tests} />
          <ArticleCta message={article.ctaMessage} />
        </div>
      </article>

      <Faq
        items={article.faq}
        eyebrow="Питання по темі"
        heading="Часті запитання"
        lead="Те, про що найчастіше запитують у звʼязку з цією темою."
      />
    </>
  );
}
