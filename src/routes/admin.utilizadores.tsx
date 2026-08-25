import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, Plus, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import {
  actualizarAdministrador,
  alterarPalavraPasse,
  criarAdministrador,
  listarAdministradores,
  modoLocal,
  removerAdministrador,
} from "@/lib/cms";

export const Route = createFileRoute("/admin/utilizadores")({
  component: AdminUtilizadores,
});

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary";

function AdminUtilizadores() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["cms", "administradores"], queryFn: listarAdministradores });

  const [novo, setNovo] = useState({ nome: "", email: "", password: "" });
  const [passwords, setPasswords] = useState({ actual: "", nova: "" });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["cms", "administradores"] });

  const criar = useMutation({
    mutationFn: () => criarAdministrador(novo),
    onSuccess: () => {
      setNovo({ nome: "", email: "", password: "" });
      invalidar();
      toast.success("Administrador criado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alternar = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => actualizarAdministrador(id, { activo }),
    onSuccess: () => {
      invalidar();
      toast.success("Estado actualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const apagar = useMutation({
    mutationFn: (id: string) => removerAdministrador(id),
    onSuccess: () => {
      invalidar();
      toast.success("Administrador eliminado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mudarPassword = useMutation({
    mutationFn: () => alterarPalavraPasse(passwords.actual, passwords.nova),
    onSuccess: () => {
      setPasswords({ actual: "", nova: "" });
      toast.success("Palavra-passe alterada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Administradores</h1>
      <p className="mt-1 text-sm font-light text-graphite">
        Contas com acesso ao painel de gestão do website.
      </p>

      {modoLocal ? (
        <p className="mt-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-graphite">
          A gestão de contas só está disponível com a API ligada (<code className="font-mono text-xs">VITE_API_URL</code>).
        </p>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-semibold text-graphite">Nome</th>
              <th className="px-4 py-3 font-semibold text-graphite">E-mail</th>
              <th className="px-4 py-3 font-semibold text-graphite">Último acesso</th>
              <th className="px-4 py-3 font-semibold text-graphite">Estado</th>
              <th className="px-4 py-3 text-right font-semibold text-graphite">Acções</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-graphite">
                  A carregar…
                </td>
              </tr>
            ) : (
              (data ?? []).map((a) => (
                <tr key={a.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 text-foreground">{a.nome}</td>
                  <td className="px-4 py-3 text-foreground">{a.email}</td>
                  <td className="px-4 py-3 text-graphite">
                    {a.ultimoAcesso ? new Date(a.ultimoAcesso).toLocaleString("pt-PT") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        a.activo ? "bg-primary/10 text-primary" : "bg-surface text-graphite"
                      }`}
                    >
                      {a.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={modoLocal}
                      onClick={() => alternar.mutate({ id: a.id, activo: !a.activo })}
                      className="mr-1 rounded-md p-2 text-graphite hover:bg-surface hover:text-primary disabled:opacity-40"
                      aria-label="Activar ou desactivar"
                    >
                      <UserCog className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={modoLocal}
                      onClick={() => {
                        if (window.confirm(`Eliminar a conta de ${a.nome}?`)) apagar.mutate(a.id);
                      }}
                      className="rounded-md p-2 text-graphite hover:bg-surface hover:text-primary disabled:opacity-40"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form
          className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          onSubmit={(e) => {
            e.preventDefault();
            criar.mutate();
          }}
        >
          <h2 className="text-lg font-bold text-foreground">Nova conta</h2>
          <div className="mt-4 space-y-3">
            <input
              className={inputCls}
              placeholder="Nome"
              required
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
            />
            <input
              className={inputCls}
              type="email"
              placeholder="E-mail"
              required
              value={novo.email}
              onChange={(e) => setNovo({ ...novo, email: e.target.value })}
            />
            <input
              className={inputCls}
              type="password"
              placeholder="Palavra-passe (mínimo 8 caracteres)"
              minLength={8}
              required
              autoComplete="new-password"
              value={novo.password}
              onChange={(e) => setNovo({ ...novo, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={modoLocal || criar.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-95 disabled:opacity-60"
          >
            {criar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Criar administrador
          </button>
        </form>

        <form
          className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          onSubmit={(e) => {
            e.preventDefault();
            mudarPassword.mutate();
          }}
        >
          <h2 className="text-lg font-bold text-foreground">Alterar a minha palavra-passe</h2>
          <div className="mt-4 space-y-3">
            <input
              className={inputCls}
              type="password"
              placeholder="Palavra-passe actual"
              autoComplete="current-password"
              required
              value={passwords.actual}
              onChange={(e) => setPasswords({ ...passwords, actual: e.target.value })}
            />
            <input
              className={inputCls}
              type="password"
              placeholder="Nova palavra-passe"
              autoComplete="new-password"
              minLength={8}
              required
              value={passwords.nova}
              onChange={(e) => setPasswords({ ...passwords, nova: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={modoLocal || mudarPassword.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-graphite hover:bg-surface disabled:opacity-60"
          >
            {mudarPassword.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Alterar
          </button>
        </form>
      </div>
    </div>
  );
}
