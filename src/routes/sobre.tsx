import { createFileRoute } from "@tanstack/react-router";
import { Car, Tractor, Factory, Wrench, Scale, BarChart3, Linkedin, Check } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import {
  quemSomos,
  historia,
  missaoVisaoValores,
  objectivos,
  areasActuacao,
  servicos,
  iniciativas,
} from "@/data/institucional";
import { orgaosSociais } from "@/data/orgaos-sociais";

const icones = { Car, Tractor, Factory, Wrench, Scale, BarChart3 } as const;

export const Route = createFileRoute("/sobre")({
  component: SobrePage,
  head: () => ({
    meta: [
      { title: "Sobre Nós — AIDAM" },
      {
        name: "description",
        content:
          "História, missão, visão, valores, objectivos, serviços e órgãos sociais da Associação de Importadores e Distribuidores de Automóveis de Moçambique.",
      },
      { property: "og:title", content: "Sobre Nós — AIDAM" },
      { property: "og:description", content: "Conheça a história, os princípios e os órgãos sociais da AIDAM." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
});

function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre Nós"
        titulo="Uma associação que representa e valoriza o sector automóvel moçambicano"
        descricao={quemSomos.resumo}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <SectionHeading eyebrow="Quem Somos" titulo="Identidade institucional" />
          </Reveal>
          <Reveal delay={100}>
            <div className="space-y-5 text-base font-light leading-relaxed text-graphite">
              {quemSomos.paragrafos.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tom="suave">
        <Reveal>
          <SectionHeading eyebrow="A Nossa História" titulo="Marcos da Associação" />
        </Reveal>
        <ol className="mt-14 space-y-0 border-l border-border pl-8">
          {historia.map((m, i) => (
            <Reveal as="li" key={m.titulo} delay={i * 80} className="relative pb-12 last:pb-0">
              <span
                className="absolute -left-[2.31rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary"
                aria-hidden="true"
              />
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{m.data}</p>
              <h3 className="mt-2 text-xl">{m.titulo}</h3>
              <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-graphite">{m.descricao}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading eyebrow="Princípios" titulo="Missão, Visão e Valores" />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal>
            <article className="h-full rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <h3 className="text-xl">Missão</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-graphite">{missaoVisaoValores.missao}</p>
            </article>
          </Reveal>
          <Reveal delay={90}>
            <article className="h-full rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <h3 className="text-xl">Visão</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-graphite">{missaoVisaoValores.visao}</p>
            </article>
          </Reveal>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {missaoVisaoValores.valores.map((v, i) => (
            <Reveal as="li" key={v.nome} delay={i * 50}>
              <div className="h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40">
                <h4 className="text-sm font-bold text-ink">{v.nome}</h4>
                <p className="mt-2 text-sm font-light leading-relaxed text-graphite">{v.descricao}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section tom="suave">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <SectionHeading eyebrow="Objectivos" titulo="Conforme os Estatutos" />
          </Reveal>
          <Reveal delay={100}>
            <ul className="space-y-4">
              {objectivos.map((o) => (
                <li key={o} className="flex gap-3 text-sm font-light leading-relaxed text-graphite">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading eyebrow="Áreas de Actuação" titulo="Segmentos representados" />
        </Reveal>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {areasActuacao.map((area, i) => {
            const Icone = icones[area.icone as keyof typeof icones];
            return (
              <Reveal as="li" key={area.titulo} delay={i * 60}>
                <div className="h-full rounded-xl border border-border bg-card p-7">
                  <Icone className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-bold">{area.titulo}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-graphite">{area.descricao}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <Section tom="suave">
        <Reveal>
          <SectionHeading eyebrow="Serviços" titulo="O que oferecemos aos associados" />
        </Reveal>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((s, i) => (
            <Reveal as="li" key={s.titulo} delay={i * 60}>
              <div className="h-full rounded-xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
                <h3 className="text-base font-bold">{s.titulo}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-graphite">{s.descricao}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Iniciativas Estratégicas"
            titulo="Prioridades da actual Direcção"
            descricao="Linhas de acção que orientam o novo ciclo institucional da Associação."
          />
        </Reveal>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {iniciativas.map((it, i) => (
            <Reveal as="li" key={it.titulo} delay={i * 60}>
              <div className="h-full rounded-xl border-l-2 border-primary bg-surface p-7">
                <h3 className="text-base font-bold">{it.titulo}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-graphite">{it.descricao}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section tom="suave">
        <Reveal>
          <SectionHeading eyebrow="Órgãos Sociais" titulo="Composição institucional" />
        </Reveal>
        <div className="mt-12 space-y-14">
          {orgaosSociais.map((orgao) => (
            <div key={orgao.id}>
              <Reveal>
                <h3 className="text-2xl">{orgao.nome}</h3>
                <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-graphite">{orgao.descricao}</p>
              </Reveal>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {orgao.membros.map((m, i) => (
                  <Reveal as="li" key={`${orgao.id}-${m.cargo}-${m.empresa}`} delay={i * 60}>
                    <div className="h-full rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">{m.cargo}</p>
                      <p className="mt-2 text-base font-bold text-ink">{m.nome}</p>
                      <p className="mt-1 text-sm font-light text-graphite">{m.empresa}</p>
                      {m.linkedin ? (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-graphite transition-colors hover:text-primary"
                        >
                          <Linkedin className="h-4 w-4" aria-hidden="true" />
                          LinkedIn
                        </a>
                      ) : null}
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
