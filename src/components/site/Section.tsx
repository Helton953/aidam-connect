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
}: {
  eyebrow: string;
  titulo: string;
  descricao: string;
}) {
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
