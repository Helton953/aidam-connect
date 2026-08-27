import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Car, Tractor, Factory, Wrench, Scale, BarChart3, Target, Eye, Gem, ChevronDown } from "lucide-react";
import heroImg from "@/assets/hero-frota.jpg";
import { FundoHeroAnimado } from "@/components/site/FundoHeroAnimado";
import { Logo } from "@/components/site/Logo";
import { Reveal } from "@/components/site/Reveal";
import { Section, SectionHeading } from "@/components/site/Section";
import { getUltimasNoticias, formatarData } from "@/lib/content";
import {
  quemSomos,
  missaoVisaoValores,
  indicadores,
  areasActuacao,
  organizacao,
} from "@/data/institucional";

const icones = { Car, Tractor, Factory, Wrench, Scale, BarChart3 } as const;

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AIDAM — Associação de Importadores e Distribuidores de Automóveis de Moçambique" },
      {
        name: "description",
        content:
          "A AIDAM representa as empresas de importação, distribuição e pós-venda de veículos, máquinas agrícolas e equipamento industrial em Moçambique.",
      },
      { property: "og:title", content: "AIDAM — Associação de Importadores e Distribuidores de Automóveis de Moçambique" },
      {
        property: "og:description",
        content: "A voz institucional do sector automóvel moçambicano. Conheça a AIDAM, os seus associados e os dados do mercado.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: organizacao.nome,
          alternateName: "AIDAM",
          url: "https://aidam.co.mz",
          telephone: organizacao.telefone,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Avenida do Trabalho, 1856, CP 1153",
            addressLocality: "Maputo",
            addressCountry: "MZ",
          },
        }),
      },
    ],
  }),
});

function Index() {
  const ultimas = getUltimasNoticias(3);

  return (
    <>
      {/* Hero — fotografia real de frota, fixa ao scroll, com véu de legibilidade */}
      <section className="relative isolate overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="fundo-hero-fixo absolute inset-0"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        {/* Véu claro que garante a leitura do texto sobre a fotografia */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
        <FundoHeroAnimado />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
          <Reveal>
            <Logo size="lg" />
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-10 max-w-4xl text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
              A voz institucional do sector automóvel em Moçambique
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-graphite">
              {organizacao.posicionamento}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-lg hover:brightness-95"
              >
                Conhecer a AIDAM
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/contactos"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold text-graphite transition-all hover:border-primary hover:text-primary"
              >
                Contactar
              </Link>
            </div>
          </Reveal>
          <Reveal delay={340}>
            <div className="mt-16 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-steel">
              <ChevronDown className="fundo-hero-indicador h-4 w-4 text-primary" aria-hidden="true" />
              <span>Descer para explorar</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quem somos */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <Reveal>
            <SectionHeading eyebrow="Quem Somos" titulo="Uma associação ao serviço de um mercado formal e sustentável" />
          </Reveal>
          <Reveal delay={100}>
            <div className="space-y-5 text-base font-light leading-relaxed text-graphite">
              <p className="text-lg font-normal text-ink">{quemSomos.resumo}</p>
              {quemSomos.paragrafos.slice(1).map((p) => (
                <p key={p}>{p}</p>
              ))}
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-primary transition-colors hover:text-ink"
              >
                Ver página institucional
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Missão, Visão e Valores */}
      <Section tom="suave">
        <Reveal>
          <SectionHeading
            eyebrow="Princípios"
            titulo="Missão, Visão e Valores"
            descricao="Os princípios que orientam a actuação da Associação e das empresas que representa."
            alinhamento="centro"
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { icone: Target, titulo: "Missão", texto: missaoVisaoValores.missao },
            { icone: Eye, titulo: "Visão", texto: missaoVisaoValores.visao },
            {
              icone: Gem,
              titulo: "Valores",
              texto: missaoVisaoValores.valores.map((v) => v.nome).join(" · "),
            },
          ].map((card, i) => (
            <Reveal key={card.titulo} delay={i * 90}>
              <article className="h-full rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]">
                <card.icone className="h-7 w-7 text-primary" aria-hidden="true" />
                <h3 className="mt-5 text-xl">{card.titulo}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-graphite">{card.texto}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Indicadores */}
      <Section>
        <Reveal>
          <SectionHeading eyebrow="Indicadores" titulo="O sector em números" />
        </Reveal>
        <dl className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {indicadores.map((ind, i) => (
            <Reveal key={ind.rotulo} delay={i * 80}>
              <div className="h-full rounded-xl border border-border bg-card p-8">
                <dt className="text-4xl font-extrabold text-primary">{ind.valor}</dt>
                <dd className="mt-3">
                  <span className="block text-sm font-semibold text-ink">{ind.rotulo}</span>
                  <span className="mt-1 block text-xs font-light text-steel">{ind.nota}</span>
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </Section>

      {/* Notícias */}
      <Section tom="suave">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionHeading eyebrow="Actualidade" titulo="Últimas notícias" />
          </Reveal>
          <Reveal delay={80}>
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-ink"
            >
              Ver todas as notícias
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
        {ultimas.length === 0 ? (
          <p className="mt-12 rounded-xl border border-border bg-card p-8 text-sm font-light text-graphite">
            Ainda não existem notícias publicadas. Volte em breve para acompanhar a actualidade da Associação.
          </p>
        ) : null}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {ultimas.map((n, i) => (
            <Reveal key={n.slug} delay={i * 90}>
              <article className="group h-full overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]">
                <Link to="/noticias/$slug" params={{ slug: n.slug }} className="block">
                  <img
                    src={n.imagem}
                    alt={n.imagemAlt}
                    loading="lazy"
                    width={1280}
                    height={720}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{n.categoria}</p>
                    <h3 className="mt-2 text-lg leading-snug transition-colors group-hover:text-primary">{n.titulo}</h3>
                    <time dateTime={n.data} className="mt-2 block text-xs text-steel">
                      {formatarData(n.data)}
                    </time>
                    <p className="mt-3 text-sm font-light leading-relaxed text-graphite">{n.resumo}</p>
                  </div>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Áreas de actuação */}
      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Áreas de Actuação"
            titulo="Onde a AIDAM actua"
            descricao="Da importação e distribuição à representação institucional e à informação de mercado."
          />
        </Reveal>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {areasActuacao.map((area, i) => {
            const Icone = icones[area.icone as keyof typeof icones];
            return (
              <Reveal as="li" key={area.titulo} delay={i * 70}>
                <div className="h-full rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
                  <Icone className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-bold">{area.titulo}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-graphite">{area.descricao}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
