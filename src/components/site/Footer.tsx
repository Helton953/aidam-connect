import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Printer, Mail } from "lucide-react";
import { Logo } from "./Logo";
import { organizacao } from "@/data/institucional";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-4 lg:px-10">
        <div className="lg:col-span-2">
          <Logo size="md" />
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Navegação</h2>
          <ul className="mt-4 space-y-2 text-sm text-graphite">
            <li>
              <Link to="/sobre" className="transition-colors hover:text-primary">
                Sobre Nós
              </Link>
            </li>
            <li>
              <Link to="/associados" className="transition-colors hover:text-primary">
                Associados
              </Link>
            </li>
            <li>
              <Link to="/noticias" className="transition-colors hover:text-primary">
                Notícias
              </Link>
            </li>
            <li>
              <Link to="/contactos" className="transition-colors hover:text-primary">
                Contactos
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Contactos</h2>
          <ul className="mt-4 space-y-3 text-sm text-graphite">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{organizacao.morada}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`tel:+258${organizacao.telefone.replace(/\s/g, "")}`} className="transition-colors hover:text-primary">
                {organizacao.telefone}
              </a>
            </li>
            <li className="flex gap-3">
              <Printer className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>Fax: {organizacao.fax}</span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${organizacao.email}`} className="transition-colors hover:text-primary">
                {organizacao.email}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex gap-4 text-sm font-semibold text-graphite">
            {organizacao.redes.map((rede) => (
              <a
                key={rede.nome}
                href={rede.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
              >
                {rede.nome}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-steel sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© {new Date().getFullYear()} AIDAM. Todos os direitos reservados.</p>
          <p>Associação de direito privado sem fins lucrativos, reconhecida em 2011.</p>
        </div>
      </div>
    </footer>
  );
}
