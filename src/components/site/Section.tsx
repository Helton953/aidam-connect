import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id,
  tom = "claro",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tom?: "claro" | "suave";
}) {
  return (
    <section
      id={id}
      className={cn("py-20 lg:py-28", tom === "suave" && "bg-surface", className)}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  titulo,
  descricao,
  alinhamento = "esquerda",
}: {
  eyebrow?: string;
  titulo: string;
  descricao?: string;
  alinhamento?: "esquerda" | "centro";
}) {
  return (
    <div className={cn("max-w-3xl", alinhamento === "centro" && "mx-auto text-center")}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl leading-tight sm:text-4xl">{titulo}</h2>
      {descricao ? <p className="mt-4 text-base font-light leading-relaxed text-graphite">{descricao}</p> : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  titulo,
  descricao,
  imagem,
}: {
  eyebrow: string;
  titulo: string;
  descricao: string;
  imagem?: string;
}) {
  if (!imagem) {
    return (
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h1 className="max-w-4xl text-4xl leading-tight sm:text-5xl">{titulo}</h1>
          <p className="mt-5 max-w-2xl text-lg font-light leading-relaxed text-graphite">{descricao}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border-b border-border">
      {/* Fotografia fixa ao scroll */}
      <div
        className="fundo-hero-fixo absolute inset-0"
        style={{ backgroundImage: `url(${imagem})` }}
        aria-hidden="true"
      />
      {/* Sobreposição centrada para legibilidade */}
      <div className="absolute inset-0 bg-ink/55" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-background"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center lg:px-10 lg:py-32">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/90">
          <span className="mr-2 inline-block h-px w-8 bg-primary align-middle" aria-hidden="true" />
          <span className="text-primary">{eyebrow}</span>
          <span className="ml-2 inline-block h-px w-8 bg-primary align-middle" aria-hidden="true" />
        </p>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          {titulo}
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-white/85">{descricao}</p>
      </div>
    </div>
  );
}
