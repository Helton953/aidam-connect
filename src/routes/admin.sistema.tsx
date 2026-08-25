import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Database, Loader2, Mail, RefreshCw, Server } from "lucide-react";
import { API_URL, estadoServico, modoLocal, verificarSmtp } from "@/lib/cms";

export const Route = createFileRoute("/admin/sistema")({
  component: AdminSistema,
});

function duracao(segundos: number) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function AdminSistema() {
  const saude = useQuery({
    queryKey: ["cms", "saude"],
    queryFn: estadoServico,
    refetchInterval: 30_000,
  });
  const smtp = useQuery({ queryKey: ["cms", "smtp"], queryFn: verificarSmtp, enabled: !modoLocal });

  const dados = saude.data;
  const cartoes = [
    {
      icone: Server,
      rotulo: "Serviço Node.js",
      valor: dados?.ok ? "Activo" : "Indisponível",
      detalhe: dados?.node ? `Node ${dados.node}` : (dados?.erro ?? "Sem resposta da API"),
      ok: Boolean(dados?.ok),
    },
    {
      icone: Database,
      rotulo: "Base de dados MySQL",
      valor: dados?.baseDados?.ok ? "Ligada" : "Sem ligação",
      detalhe: dados?.baseDados?.ok
        ? `Latência ${dados.baseDados.latenciaMs ?? 0} ms`
        : (dados?.baseDados?.erro ?? "—"),
      ok: Boolean(dados?.baseDados?.ok),
    },
    {
      icone: Mail,
      rotulo: "Envio de email (SMTP)",
      valor: smtp.data?.ok ? "Operacional" : smtp.data?.configurado ? "Com erro" : "Não configurado",
      detalhe: smtp.data?.erro ?? "Configurável em Definições",
      ok: Boolean(smtp.data?.ok),
    },
    {
      icone: Activity,
      rotulo: "Tempo em execução",
      valor: dados?.uptimeSegundos !== undefined ? duracao(dados.uptimeSegundos) : "—",
      detalhe: dados?.memoriaMb !== undefined ? `${dados.memoriaMb} MB de memória` : "—",
      ok: Boolean(dados?.ok),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estado do sistema</h1>
          <p className="mt-1 text-sm font-light text-graphite">
            Diagnóstico do serviço Node.js, da base de dados e do envio de email.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void saude.refetch();
            void smtp.refetch();
          }}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-graphite hover:bg-surface"
        >
          {saude.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Verificar agora
        </button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cartoes.map((c) => (
          <div key={c.rotulo} className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <c.icone className="h-5 w-5 text-primary" aria-hidden />
              <span
                className={`h-2.5 w-2.5 rounded-full ${c.ok ? "bg-primary" : "bg-mid-grey"}`}
                aria-label={c.ok ? "Operacional" : "Com problema"}
              />
            </div>
            <p className="mt-4 text-xl font-extrabold text-foreground">{c.valor}</p>
            <p className="mt-1 text-sm font-semibold text-graphite">{c.rotulo}</p>
            <p className="mt-1 text-xs font-light text-graphite">{c.detalhe}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-bold text-foreground">Ligação à API</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-graphite">Endereço</dt>
            <dd className="break-all text-foreground">{API_URL || "— (modo de demonstração)"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-graphite">Endpoint de verificação</dt>
            <dd className="break-all text-foreground">{`${API_URL || "https://api.aidam.co.mz"}/api/health`}</dd>
          </div>
          <div>
            <dt className="font-semibold text-graphite">Hora do servidor</dt>
            <dd className="text-foreground">
              {dados?.horaServidor ? new Date(dados.horaServidor).toLocaleString("pt-PT") : "—"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-graphite">Actualização</dt>
            <dd className="text-foreground">Automática a cada 30 segundos</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
