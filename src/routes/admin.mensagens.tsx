import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { actualizar, listar, remover } from "@/lib/cms";

export const Route = createFileRoute("/admin/mensagens")({
  component: AdminMensagens,
});

function AdminMensagens() {
  const queryClient = useQueryClient();
  const chave = ["cms", "mensagens"];
  const { data, isLoading, error } = useQuery({ queryKey: chave, queryFn: () => listar("mensagens") });
  const [aberta, setAberta] = useState<string | null>(null);

  const marcar = useMutation({
    mutationFn: ({ id, lida }: { id: string; lida: boolean }) => actualizar("mensagens", id, { lida }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
    onError: (e: Error) => toast.error(e.message),
  });

  const apagar = useMutation({
    mutationFn: (id: string) => remover("mensagens", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chave });
      toast.success("Mensagem eliminada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mensagens = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Mensagens</h1>
      <p className="mt-1 text-sm font-light text-graphite">
        Submissões recebidas através do formulário de contacto do website.
      </p>

      {isLoading ? (
        <p className="mt-8 text-sm text-graphite">A carregar…</p>
      ) : error ? (
        <p className="mt-8 text-sm text-primary">{(error as Error).message}</p>
      ) : mensagens.length === 0 ? (
        <p className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-sm font-light text-graphite">
          Ainda não foram recebidas mensagens.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {mensagens.map((m) => {
            const expandida = aberta === m.id;
            return (
              <li key={m.id} className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
                <div className="flex flex-wrap items-center gap-3 p-4">
                  {m.lida ? (
                    <MailOpen className="h-4 w-4 shrink-0 text-graphite" />
                  ) : (
                    <Mail className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setAberta(expandida ? null : m.id);
                      if (!m.lida) marcar.mutate({ id: m.id, lida: true });
                    }}
                    className="flex-1 text-left"
                    aria-expanded={expandida}
                  >
                    <span className={m.lida ? "text-sm text-foreground" : "text-sm font-bold text-foreground"}>
                      {m.assunto || "(sem assunto)"}
                    </span>
                    <span className="ml-2 text-xs font-light text-graphite">
                      {m.nome}
                      {m.empresa ? ` · ${m.empresa}` : ""} · {new Date(m.criadaEm).toLocaleString("pt-PT")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => marcar.mutate({ id: m.id, lida: !m.lida })}
                    className="text-xs font-semibold text-graphite hover:text-primary"
                  >
                    {m.lida ? "Marcar por ler" : "Marcar como lida"}
                  </button>
                  <button
                    type="button"
                    aria-label="Eliminar mensagem"
                    onClick={() => {
                      if (window.confirm("Eliminar esta mensagem?")) apagar.mutate(m.id);
                    }}
                    className="rounded-md p-2 text-graphite hover:text-primary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {expandida ? (
                  <div className="border-t border-border px-4 py-4">
                    <p className="text-sm font-light text-graphite">
                      <a href={`mailto:${m.email}`} className="font-semibold text-primary hover:underline">
                        {m.email}
                      </a>
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">{m.mensagem}</p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
