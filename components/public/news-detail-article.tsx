import { Badge } from "@/components/ui/badge";
import { PublicBackLink } from "@/components/public/public-back-link";

export type NewsDetailArticleCopy = {
  noDetails: string;
  backToNews: string;
};

type NewsDetailArticleProps = {
  title: string;
  categoryName: string;
  publishContext: string;
  /** HTML string from the rich text editor */
  contentHtml: string;
  backHref: string;
  copy: NewsDetailArticleCopy;
};

export function NewsDetailArticle({
  title,
  categoryName,
  publishContext,
  contentHtml,
  backHref,
  copy,
}: NewsDetailArticleProps) {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{categoryName}</Badge>
        <span className="text-sm text-slate-500">{publishContext}</span>
      </div>

      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {title}
        </h1>
      </header>

      <section className="text-base leading-7 text-slate-800 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-2.5 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:my-1 [&_strong]:font-bold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600">
        {contentHtml ? (
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        ) : (
          <p>{copy.noDetails}</p>
        )}
      </section>

      <footer className="pt-2">
        <PublicBackLink href={backHref} label={copy.backToNews} />
      </footer>
    </article>
  );
}
