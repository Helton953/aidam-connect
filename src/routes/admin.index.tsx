import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Newspaper,
  Building2,
  Users,
  Mail,
  Plus,
  ArrowRight,
  Activity,
  Database,
  Send,
} from "lucide-react";
import { estadoServico, listar, modoLocal } from "@/lib/cms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminResumo,
});

function AdminResumo() {
  const noticias = useQuery({ queryKey: ["cms", "noticias"], queryFn: () => listar("noticias") });
  const associados = useQuery({ queryKey: ["cms", "associados"], queryFn: () => listar("associados") });
  const orgaos = useQuery({ queryKey: ["cms", "orgaos"], queryFn: () => listar("orgaos") });
  const mensagens = useQuery({ queryKey: ["cms", "mensagens"], queryFn: () => listar("mensagens") });
  const saude = useQuery({
    queryKey: ["cms", "saude"],
    queryFn: estadoServico,
    enabled: !modoLocal,
    refetchInterval: 60_000,
  });

  const listaNoticias = noticias.data ?? [];
  const listaMensagens = mensagens.data ?? [];
  const publicadas = listaNoticias.filter((n) => n.publicada).length;
  const rascunhos = listaNoticias.length - publicadas;
  const porLer = listaMensagens.filter((m) => !m.lida).length;

  const metricas = [
    {
      to: "/admin/noticias",
      rotulo: "Notícias",
      valor: listaNoticias.length,
      nota: `${publicadas} publicadas · ${rascunhos} rascunho${rascunhos === 1 ? "" : "s"}`,
      icon: Newspaper,
    },
    {
      to: "/admin/associados",
      rotulo: "Associados",
      valor: associados.data?.length ?? 0,
      nota: "Portfólio do website",
      icon: Building2,
    },
    {
      to: "/admin/orgaos",
      rotulo: "Órgãos sociais",
      valor: orgaos.data?.length ?? 0,
      nota: "Membros publicados",
      icon: Users,
    },
    {
      to: "/admin/mensagens",
      rotulo: "Mensagens por ler",
      valor: porLer,
      nota: `${listaMensagens.length} no total`,
      icon: Mail,
      destaque: porLer > 0,
    },
  ] as const;

  const accoes = [
    { to: "/admin/noticias", label: "Nova notícia" },
    { to: "/admin/associados", label: "Novo associado" },
    { to: "/admin/ficheiros", label: "Carregar ficheiro" },
    { to: "/admin/definicoes", label: "Definições do site" },
  ] as const;

  const online = modoLocal ? true : Boolean(saude.data?.ok && saude.data.baseDados?.ok);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Resumo</h1>
          <p className="mt-1 text-sm font-light text-graphite">
            Estado actual dos conteúdos e do serviço do website institucional.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {accoes.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-graphite transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metricas.map((m) => (
          <Link
            key={m.rotulo}
            to={m.to}
            className={cn(
              "group rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-md",
              "destaque" in m && m.destaque ? "border-l-4 border-l-primary" : null,
            )}
          >
            <div className="flex items-start justify-between">
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-graphite">{m.rotulo}</p>
              <m.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">{m.valor}</p>
            <p className="mt-1 text-xs font-light text-graphite">{m.nota}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Últimas notícias */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] xl:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-bold text-foreground">Últimas notícias</h2>
            <Link
              to="/admin/noticias"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-[0.68rem] uppercase tracking-wider text-graphite">
              <tr>
                <th className="px-5 py-3 font-bold">Título</th>
                <th className="px-5 py-3 font-bold">Data</th>
                <th className="px-5 py-3 font-bold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {listaNoticias.slice(0, 6).map((n) => (
                <tr key={n.id} className="border-b border-border/60 last:border-0">
                  <td className="max-w-[24rem] truncate px-5 py-3 font-medium text-foreground">{n.titulo}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-graphite">{n.data}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide",
                        n.publicada ? "bg-primary/10 text-primary" : "bg-surface text-graphite",
                      )}
                    >
                      {n.publicada ? "Publicada" : "Rascunho"}
                    </span>
                  </td>
                </tr>
              ))}
              {listaNoticias.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm font-light text-graphite">
                    Ainda não existem notícias.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {/* Estado do serviço */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Estado do serviço</h2>
              <Link to="/admin/sistema" className="text-xs font-semibold text-primary hover:underline">
                Detalhes
              </Link>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-graphite">
                  <Activity className="h-4 w-4 text-mid-grey" /> API
                </span>
                <Estado ok={online} texto={modoLocal ? "Demonstração" : online ? "Operacional" : "Indisponível"} />
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-graphite">
                  <Database className="h-4 w-4 text-mid-grey" /> Base de dados
                </span>
                <Estado
                  ok={modoLocal ? true : Boolean(saude.data?.baseDados?.ok)}
                  texto={
                    modoLocal
                      ? "Local"
                      : saude.data?.baseDados?.ok
                        ? `${saude.data.baseDados.latenciaMs ?? 0} ms`
                        : "Sem ligação"
                  }
                />
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-graphite">
                  <Send className="h-4 w-4 text-mid-grey" /> SMTP
                </span>
                <Estado
                  ok={Boolean(saude.data?.smtp?.configurado)}
                  texto={saude.data?.smtp?.configurado ? "Configurado" : "Por configurar"}
                />
              </li>
            </ul>
          </div>

          {/* Mensagens recentes */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-bold text-foreground">Mensagens recentes</h2>
              <Link to="/admin/mensagens" className="text-xs font-semibold text-primary hover:underline">
                Caixa de entrada
              </Link>
            </div>
            <ul className="divide-y divide-border/60">
              {listaMensagens.slice(0, 4).map((m) => (
                <li key={m.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{m.nome}</p>
                    {!m.lida ? (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-primary">
                        Nova
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs font-light text-graphite">{m.assunto}</p>
                </li>
              ))}
              {listaMensagens.length === 0 ? (
                <li className="px-5 py-8 text-center text-sm font-light text-graphite">Sem mensagens.</li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Estado({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground">
      <span className={cn("h-2 w-2 rounded-full", ok ? "bg-primary" : "bg-mid-grey")} aria-hidden />
      {texto}
    </span>
  );
}
