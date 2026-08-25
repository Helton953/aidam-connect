import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, Building2, Users, Mail } from "lucide-react";
import { listar } from "@/lib/cms";

export const Route = createFileRoute("/admin/")({
  component: AdminResumo,
});

function AdminResumo() {
  const noticias = useQuery({ queryKey: ["cms", "noticias"], queryFn: () => listar("noticias") });
  const associados = useQuery({ queryKey: ["cms", "associados"], queryFn: () => listar("associados") });
  const orgaos = useQuery({ queryKey: ["cms", "orgaos"], queryFn: () => listar("orgaos") });
  const mensagens = useQuery({ queryKey: ["cms", "mensagens"], queryFn: () => listar("mensagens") });

  const cartoes = [
    { to: "/admin/noticias", rotulo: "Notícias", valor: noticias.data?.length ?? 0, icon: Newspaper },
    { to: "/admin/associados", rotulo: "Associados", valor: associados.data?.length ?? 0, icon: Building2 },
    { to: "/admin/orgaos", rotulo: "Membros dos órgãos sociais", valor: orgaos.data?.length ?? 0, icon: Users },
    {
      to: "/admin/mensagens",
      rotulo: "Mensagens por ler",
      valor: (mensagens.data ?? []).filter((m) => !m.lida).length,
      icon: Mail,
    },
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Resumo</h1>
      <p className="mt-1 text-sm font-light text-graphite">Estado actual dos conteúdos do website institucional.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cartoes.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-md"
          >
            <c.icon className="h-5 w-5 text-primary" />
            <p className="mt-4 text-3xl font-extrabold text-foreground">{c.valor}</p>
            <p className="mt-1 text-sm font-light text-graphite">{c.rotulo}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-bold text-foreground">Últimas notícias</h2>
        <ul className="mt-4 space-y-3">
          {(noticias.data ?? []).slice(0, 5).map((n) => (
            <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 last:border-0">
              <span className="text-sm text-foreground">{n.titulo}</span>
              <span className="text-xs font-light text-graphite">
                {n.data} · {n.publicada ? "Publicada" : "Rascunho"}
              </span>
            </li>
          ))}
          {(noticias.data ?? []).length === 0 ? (
            <li className="text-sm font-light text-graphite">Ainda não existem notícias.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
