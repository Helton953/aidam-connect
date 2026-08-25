import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { getNoticia, getNoticias, formatarData } from "@/lib/content";

export const Route = createFileRoute("/noticias/$slug")({
  loader: ({ params }) => {
    const noticia = getNoticia(params.slug);
    if (!noticia) throw notFound();
    return { noticia };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Notícia não encontrada — AIDAM" }, { name: "robots", content: "noindex" }] };
    }
    const { noticia } = loaderData;
    return {
      meta: [
        { title: `${noticia.titulo} — AIDAM` },
        { name: "description", content: noticia.resumo },
        { property: "og:title", content: noticia.titulo },
        { property: "og:description", content: noticia.resumo },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/noticias/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/noticias/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: noticia.titulo,
            datePublished: noticia.data,
            description: noticia.resumo,
            author: { "@type": "Organization", name: "AIDAM" },
          }),
        },
      ],
    };
  },
  component: NoticiaPage,
});

function NoticiaPage() {
  const { noticia } = Route.useLoaderData();
  const outras = getNoticias()
    .filter((n) => n.slug !== noticia.slug)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <Link
        to="/noticias"
        className="inline-flex items-center gap-2 text-sm font-semibold text-graphite transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar às notícias
      </Link>

      <p className="mt-10 text-xs font-bold uppercase tracking-[0.16em] text-primary">{noticia.categoria}</p>
      <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{noticia.titulo}</h1>
      <time dateTime={noticia.data} className="mt-4 block text-sm text-steel">
        {formatarData(noticia.data)}
      </time>

      <img
        src={noticia.imagem}
        alt={noticia.imagemAlt}
        width={1280}
        height={720}
        className="mt-10 aspect-[16/9] w-full rounded-xl object-cover"
      />

      <div className="mt-10 space-y-6 text-base font-light leading-relaxed text-graphite">
        <p className="text-lg font-normal text-ink">{noticia.resumo}</p>
        {noticia.corpo.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <section className="mt-20 border-t border-border pt-12">
        <h2 className="text-2xl">Outras notícias</h2>
        <ul className="mt-8 space-y-6">
          {outras.map((n, i) => (
            <Reveal as="li" key={n.slug} delay={i * 70}>
              <Link
                to="/noticias/$slug"
                params={{ slug: n.slug }}
                className="group block rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{n.categoria}</p>
                <h3 className="mt-2 text-base font-bold transition-colors group-hover:text-primary">{n.titulo}</h3>
                <time dateTime={n.data} className="mt-1 block text-xs text-steel">
                  {formatarData(n.data)}
                </time>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </article>
  );
}
