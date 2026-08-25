import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { actualizar, criar, listar, remover, type RecursoCms, type RegistoPorRecurso } from "@/lib/cms";
import { CampoImagem } from "@/components/admin/CampoImagem";
import { cn } from "@/lib/utils";

export type CampoTipo =
  | "texto"
  | "area"
  | "numero"
  | "data"
  | "seleccao"
  | "booleano"
  | "imagem"
  | "url";

export type Campo<T> = {
  nome: keyof T & string;
  rotulo: string;
  tipo?: CampoTipo;
  opcoes?: string[];
  ajuda?: string;
  obrigatorio?: boolean;
  largura?: "completa" | "meia";
};

type Props<R extends RecursoCms> = {
  recurso: R;
  titulo: string;
  descricao: string;
  campos: Campo<RegistoPorRecurso[R]>[];
  colunas: (keyof RegistoPorRecurso[R] & string)[];
  vazio: Omit<RegistoPorRecurso[R], "id">;
  rotuloNovo?: string;
};

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary";

export function Crud<R extends RecursoCms>({
  recurso,
  titulo,
  descricao,
  campos,
  colunas,
  vazio,
  rotuloNovo = "Novo registo",
}: Props<R>) {
  type Registo = RegistoPorRecurso[R];
  const queryClient = useQueryClient();
  const chave = ["cms", recurso];
  const { data, isLoading, error } = useQuery({ queryKey: chave, queryFn: () => listar(recurso) });

  const [editar, setEditar] = useState<Partial<Registo> | null>(null);
  const [pesquisa, setPesquisa] = useState("");

  const guardar = useMutation({
    mutationFn: async (registo: Partial<Registo>) => {
      const id = (registo as { id?: string }).id;
      if (id) return actualizar(recurso, id, registo);
      return criar(recurso, registo as Omit<Registo, "id">);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chave });
      setEditar(null);
      toast.success("Alterações guardadas.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const apagar = useMutation({
    mutationFn: (id: string) => remover(recurso, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chave });
      toast.success("Registo eliminado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lista = useMemo(() => {
    const registos = (data ?? []) as Registo[];
    const termo = pesquisa.trim().toLowerCase();
    if (!termo) return registos;
    return registos.filter((r) =>
      Object.values(r as Record<string, unknown>).some((v) => String(v).toLowerCase().includes(termo)),
    );
  }, [data, pesquisa]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{titulo}</h1>
          <p className="mt-1 text-sm font-light text-graphite">{descricao}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditar({ ...(vazio as object) } as Partial<Registo>)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95"
        >
          <Plus className="h-4 w-4" /> {rotuloNovo}
        </button>
      </div>

      <input
        type="search"
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
        placeholder="Pesquisar…"
        aria-label="Pesquisar registos"
        className={cn(inputCls, "mt-6 max-w-sm")}
      />

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              {colunas.map((c) => (
                <th key={c} className="px-4 py-3 font-semibold text-graphite">
                  {campos.find((f) => f.nome === c)?.rotulo ?? c}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-graphite">Acções</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={colunas.length + 1} className="px-4 py-10 text-center text-graphite">
                  A carregar…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={colunas.length + 1} className="px-4 py-10 text-center text-primary">
                  {(error as Error).message}
                </td>
              </tr>
            ) : lista.length === 0 ? (
              <tr>
                <td colSpan={colunas.length + 1} className="px-4 py-10 text-center text-graphite">
                  Sem registos.
                </td>
              </tr>
            ) : (
              lista.map((registo) => {
                const id = (registo as { id: string }).id;
                return (
                  <tr key={id} className="border-b border-border/60 last:border-0">
                    {colunas.map((c) => {
                      const valor = (registo as Record<string, unknown>)[c];
                      const eImagem = campos.find((f) => f.nome === c)?.tipo === "imagem";
                      if (eImagem) {
                        return (
                          <td key={c} className="px-4 py-3">
                            {valor ? (
                              <img
                                src={String(valor)}
                                alt=""
                                className="h-10 w-16 rounded border border-border object-cover"
                              />
                            ) : (
                              <span className="text-xs text-graphite">—</span>
                            )}
                          </td>
                        );
                      }
                      return (
                        <td key={c} className="max-w-[22rem] truncate px-4 py-3 text-foreground">
                          {typeof valor === "boolean" ? (
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                                valor ? "bg-primary/10 text-primary" : "bg-surface text-graphite",
                              )}
                            >
                              {valor ? "Sim" : "Não"}
                            </span>
                          ) : (
                            String(valor ?? "")
                          )}
                        </td>
                      );
                    })}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditar(registo)}
                        aria-label="Editar"
                        className="mr-1 rounded-md p-2 text-graphite transition-colors hover:bg-surface hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Eliminar este registo?")) apagar.mutate(id);
                        }}
                        aria-label="Eliminar"
                        className="rounded-md p-2 text-graphite transition-colors hover:bg-surface hover:text-primary"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editar ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-soft-black/50 p-4 py-10">
          <div className="w-full max-w-3xl rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-foreground">
                {(editar as { id?: string }).id ? "Editar registo" : rotuloNovo}
              </h2>
              <button
                type="button"
                onClick={() => setEditar(null)}
                aria-label="Fechar"
                className="rounded-md p-1 text-graphite hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="mt-6 grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                guardar.mutate(editar);
              }}
            >
              {campos.map((campo) => {
                const valor = (editar as Record<string, unknown>)[campo.nome];
                const definir = (v: unknown) => setEditar((prev: Partial<Registo> | null) => ({ ...(prev as object), [campo.nome]: v }) as Partial<Registo>);
                const id = `campo-${campo.nome}`;
                return (
                  <div
                    key={campo.nome}
                    className={cn(campo.largura === "meia" ? "sm:col-span-1" : "sm:col-span-2")}
                  >
                    <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-foreground">
                      {campo.rotulo}
                    </label>
                    {campo.tipo === "imagem" ? (
                      <CampoImagem
                        id={id}
                        valor={String(valor ?? "")}
                        ajuda={campo.ajuda}
                        onChange={(url) => definir(url)}
                      />
                    ) : campo.tipo === "area" ? (
                      <textarea
                        id={id}
                        rows={6}
                        required={campo.obrigatorio}
                        value={String(valor ?? "")}
                        onChange={(e) => definir(e.target.value)}
                        className={inputCls}
                      />
                    ) : campo.tipo === "seleccao" ? (
                      <select
                        id={id}
                        value={String(valor ?? "")}
                        onChange={(e) => definir(e.target.value)}
                        className={inputCls}
                      >
                        {(campo.opcoes ?? []).map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : campo.tipo === "booleano" ? (
                      <label className="inline-flex items-center gap-2 text-sm text-graphite">
                        <input
                          id={id}
                          type="checkbox"
                          checked={Boolean(valor)}
                          onChange={(e) => definir(e.target.checked)}
                          className="h-4 w-4 accent-[var(--color-primary)]"
                        />
                        Activo
                      </label>
                    ) : (
                      <input
                        id={id}
                        type={
                          campo.tipo === "numero"
                            ? "number"
                            : campo.tipo === "data"
                              ? "date"
                              : campo.tipo === "url"
                                ? "url"
                                : "text"
                        }
                        required={campo.obrigatorio}
                        value={String(valor ?? "")}
                        onChange={(e) =>
                          definir(campo.tipo === "numero" ? Number(e.target.value) : e.target.value)
                        }
                        className={inputCls}
                      />
                    )}
                    {campo.ajuda ? <p className="mt-1 text-xs font-light text-graphite">{campo.ajuda}</p> : null}
                  </div>
                );
              })}

              <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditar(null)}
                  className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-graphite transition-colors hover:bg-surface"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardar.isPending}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 disabled:opacity-60"
                >
                  {guardar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
