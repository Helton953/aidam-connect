import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PageHero, Section, SectionHeading } from "@/components/site/Section";
import heroNoticias from "@/assets/hero-noticias.jpg";
import { Reveal } from "@/components/site/Reveal";
import { getNoticias, formatarData, getMercado } from "@/lib/content";
import { cn } from "@/lib/utils";

const POR_PAGINA = 4;

export const Route = createFileRoute("/noticias/")({
  component: NoticiasPage,
  head: () => ({
    meta: [
      { title: "Notícias e Dados de Mercado — AIDAM" },
      {
        name: "description",
        content:
          "Notícias da AIDAM e do sector automóvel moçambicano, comunicados, eventos e indicadores de mercado como o Total Industry Volume.",
      },
      { property: "og:title", content: "Notícias e Dados de Mercado — AIDAM" },
      { property: "og:description", content: "Actualidade do sector automóvel em Moçambique e indicadores de mercado." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/noticias" },
    ],
    links: [{ rel: "canonical", href: "/noticias" }],
  }),
});

const CORES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--border)"];

function NoticiasPage() {
  const todas = getNoticias();
  const mercado = getMercado();
  const [pesquisa, setPesquisa] = useState("");
  const [pagina, setPagina] = useState(1);
  const semDados =
    mercado.tivAnual.length === 0 &&
    mercado.evolucaoMensal.length === 0 &&
    mercado.quotasMercado.length === 0 &&
    mercado.segmentacao.length === 0;

  const filtradas = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    if (!termo) return todas;
    return todas.filter(
      (n) =>
        n.titulo.toLowerCase().includes(termo) ||
        n.resumo.toLowerCase().includes(termo) ||
        n.categoria.toLowerCase().includes(termo),
    );
  }, [todas, pesquisa]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  return (
    <>
      <PageHero
        eyebrow="Notícias"
        titulo="Actualidade da Associação e do sector automóvel"
        descricao="Comunicados institucionais, análises do mercado, eventos e estudos sobre a evolução do sector em Moçambique."
        imagem={heroNoticias}
      />

      <Section>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SectionHeading eyebrow="Arquivo" titulo="Todas as publicações" />
          <div className="relative w-full max-w-sm">
            <label htmlFor="pesquisa-noticias" className="sr-only">
              Pesquisar notícias
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel"
              aria-hidden="true"
            />
            <input
              id="pesquisa-noticias"
              type="search"
              value={pesquisa}
              onChange={(e) => {
                setPesquisa(e.target.value);
                setPagina(1);
              }}
              placeholder="Pesquisar por título ou categoria"
              className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-steel focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <ul className="mt-12 space-y-8">
          {visiveis.map((n, i) => (
            <Reveal as="li" key={n.slug} delay={i * 70}>
              <article className="group grid gap-6 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)] sm:grid-cols-[minmax(0,18rem)_1fr]">
                <Link to="/noticias/$slug" params={{ slug: n.slug }} aria-label={n.titulo}>
                  <img
                    src={n.imagem}
                    alt={n.imagemAlt}
                    loading="lazy"
                    width={1280}
                    height={720}
                    className="h-full min-h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>
                <div className="p-6 sm:py-8 sm:pr-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{n.categoria}</p>
                  <h3 className="mt-2 text-xl leading-snug">
                    <Link to="/noticias/$slug" params={{ slug: n.slug }} className="transition-colors hover:text-primary">
                      {n.titulo}
                    </Link>
                  </h3>
                  <time dateTime={n.data} className="mt-2 block text-xs text-steel">
                    {formatarData(n.data)}
                  </time>
                  <p className="mt-3 text-sm font-light leading-relaxed text-graphite">{n.resumo}</p>
                  <Link
                    to="/noticias/$slug"
                    params={{ slug: n.slug }}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-ink"
                  >
                    Ler notícia
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        {filtradas.length === 0 ? (
          <p className="mt-10 text-sm text-graphite">Nenhuma notícia corresponde à pesquisa.</p>
        ) : null}

        {totalPaginas > 1 ? (
          <nav aria-label="Paginação de notícias" className="mt-12 flex flex-wrap items-center gap-2">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPagina(p)}
                aria-current={p === paginaActual ? "page" : undefined}
                className={cn(
                  "h-10 w-10 rounded-md border text-sm font-semibold transition-all",
                  p === paginaActual
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-graphite hover:border-primary hover:text-primary",
                )}
              >
                {p}
              </button>
            ))}
          </nav>
        ) : null}
      </Section>

      <Section tom="suave" id="dados-de-mercado">
        <Reveal>
          <SectionHeading
            eyebrow="Dados de Mercado"
            titulo="Indicadores do mercado automóvel"
            descricao={mercado.notaMetodologica}
          />
        </Reveal>

        {semDados ? (
          <p className="mt-12 rounded-xl border border-border bg-card p-8 text-sm font-light text-graphite">
            Os indicadores de mercado ainda não estão disponíveis. Serão publicados assim que os reportes dos associados
            forem consolidados.
          </p>
        ) : null}
        <div className={cn("mt-12 grid gap-6 lg:grid-cols-2", semDados && "hidden")}>
          <Reveal>
            <Grafico titulo="Total Industry Volume (unidades/ano)">
              <BarChart data={mercado.tivAnual}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="ano" stroke="var(--steel)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--steel)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="volume" name="Unidades" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </Grafico>
          </Reveal>

          <Reveal delay={90}>
            <Grafico titulo="Evolução mensal (último ano)">
              <LineChart data={mercado.evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--steel)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--steel)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="volume" name="Unidades" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </Grafico>
          </Reveal>

          <Reveal delay={140}>
            <Grafico titulo="Quotas de mercado por marca (%)">
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Pie data={mercado.quotasMercado} dataKey="quota" nameKey="marca" innerRadius={55} outerRadius={95}>
                  {mercado.quotasMercado.map((entry, index) => (
                    <Cell key={entry.marca} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
              </PieChart>
            </Grafico>
          </Reveal>

          <Reveal delay={190}>
            <Grafico titulo="Segmentação por categoria (unidades)">
              <BarChart data={mercado.segmentacao} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--steel)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="categoria"
                  stroke="var(--steel)"
                  fontSize={11}
                  width={130}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="volume" name="Unidades" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </Grafico>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
  fontSize: 12,
} as const;

function Grafico({ titulo, children }: { titulo: string; children: React.ReactElement }) {
  return (
    <figure className="h-full rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <figcaption className="text-sm font-bold text-ink">{titulo}</figcaption>
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
