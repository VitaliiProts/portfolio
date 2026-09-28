import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { JsonLd } from '@/components/JsonLd';
import { articlePath, getArticle, visibleArticles } from '@/lib/articles';
import { buildArticleJsonLd } from '@/lib/jsonLd';
import { site } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

/** Невідомий slug має падати в 404 на збірці, а не рендеритись у рантаймі. */
export const dynamicParams = false;

export function generateStaticParams() {
  return visibleArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const path = articlePath(article.slug);
  const image = {
    url: site.ogImage,
    width: 933,
    height: 1400,
    alt: `Психолог ${site.shortName} — фахівець з РХП`,
  };

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: path },
    // openGraph у Next.js не зливається з батьківським, а заміщає його цілком,
    // тому siteName, locale й зображення передаємо тут щоразу.
    openGraph: {
      type: 'article',
      url: path,
      title: article.title,
      description: article.description,
      siteName: site.name,
      locale: site.locale,
      images: [image],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [site.url],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [site.ogImage],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <JsonLd data={buildArticleJsonLd(article)} />
      <ArticlePage article={article} />
    </>
  );
}
