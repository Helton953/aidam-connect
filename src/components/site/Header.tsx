import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const navegacao = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre Nós" },
  { to: "/associados", label: "Associados" },
  { to: "/noticias", label: "Notícias" },
  { to: "/contactos", label: "Contactos" },
] as const;

export function Header() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <Link to="/" aria-label="AIDAM — página inicial" className="shrink-0">
          <Logo size="sm" showTagline={false} />
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-8 lg:flex">
          {navegacao.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="text-sm font-semibold text-graphite transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/contactos"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-95"
          >
            Fale connosco
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu-movel"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          className="inline-flex items-center justify-center rounded-md border border-border p-2 text-graphite transition-colors hover:text-primary lg:hidden"
        >
          {aberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        id="menu-movel"
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 lg:hidden",
          aberto ? "max-h-96" : "max-h-0",
        )}
      >
        <nav aria-label="Navegação principal (telemóvel)" className="flex flex-col px-6 py-2">
          {navegacao.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              onClick={() => setAberto(false)}
              className="border-b border-border/60 py-3 text-sm font-semibold text-graphite last:border-0 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
