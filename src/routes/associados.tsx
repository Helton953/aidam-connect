import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { getAssociados, getCategoriasAssociado } from "@/lib/content";
import type { CategoriaAssociado } from "@/data/associados";
import { cn } from "@/lib/utils";
import heroAssociados from "@/assets/hero-associados.jpg";

export const Route = createFileRoute("/associados")({
  component: AssociadosPage,
  head: () => ({
    meta: [
      { title: "Associados — AIDAM" },
      {
        name: "description",
        content:
          "Empresas associadas da AIDAM e marcas representadas em Moçambique: viaturas ligeiras, máquinas agrícolas e equipamento industrial.",
      },
      { property: "og:title", content: "Associados — AIDAM" },
      { property: "og:description", content: "Conheça as empresas associadas da AIDAM e as marcas que representam." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/associados" },
    ],
    links: [{ rel: "canonical", href: "/associados" }],
  }),
});

function AssociadosPage() {
  const associados = getAssociados();
  const categorias = getCategoriasAssociado();
  const [filtro, setFiltro] = useState<CategoriaAssociado | "todos">("todos");

  const lista = useMemo(
    () => (filtro === "todos" ? associados : associados.filter((a) => a.categorias.includes(filtro))),
    [associados, filtro],
  );

  return (
    <>
      <PageHero
        eyebrow="Portfólio"
        titulo="Associados e marcas representadas"
        descricao="As empresas que integram a AIDAM representam algumas das principais marcas mundiais de automóveis, máquinas agrícolas e equipamento industrial no mercado moçambicano."
        imagem={heroAssociados}
      />

      <Section>
        <div role="group" aria-label="Filtrar por tipo de negócio" className="flex flex-wrap gap-3">
          <FiltroBotao activo={filtro === "todos"} onClick={() => setFiltro("todos")}>
            Todos
          </FiltroBotao>
          {categorias.map((c) => (
            <FiltroBotao key={c.id} activo={filtro === c.id} onClick={() => setFiltro(c.id)}>
              {c.nome}
            </FiltroBotao>
          ))}
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((a, i) => (
            <Reveal as="li" key={a.id} delay={i * 60}>
              <article className="flex h-full flex-col rounded-xl border border-border bg-card p-7 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]">
                <div className="flex h-20 items-center justify-center rounded-lg bg-surface px-4">
                  {a.logotipo ? (
                    <img src={a.logotipo} alt={`Logótipo ${a.nome}`} loading="lazy" className="max-h-12 w-auto" />
                  ) : (
                    <span className="text-lg font-extrabold tracking-tight text-graphite">{a.nome}</span>
                  )}
                </div>
                <h2 className="mt-6 text-lg">{a.nome}</h2>
                <p className="mt-2 text-sm font-light leading-relaxed text-graphite">{a.descricao}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {a.marcas.map((m) => (
                    <li
                      key={m}
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-graphite"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
                <a
                  href={a.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-ink"
                >
                  Website oficial
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </article>
            </Reveal>
          ))}
        </ul>

        {lista.length === 0 ? (
          <p className="mt-12 text-sm text-graphite">Não existem associados nesta categoria.</p>
        ) : null}
      </Section>
    </>
  );
}

function FiltroBotao({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "rounded-full border px-5 py-2 text-sm font-semibold transition-all",
        activo
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-graphite hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
