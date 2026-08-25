import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X, Loader2, Search } from "lucide-react";
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
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-background";

const rotuloCls = "mb-1.5 block text-[0.68rem] font-bold uppercase tracking-wider text-graphite";

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

  const idActivo = editar ? (editar as { id?: string }).id : undefined;

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
      setEditar(null);
      toast.success("Registo eliminado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const registos = useMemo(() => (data ?? []) as Registo[], [data]);

  const lista = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    if (!termo) return registos;
    return registos.filter((r) =>
      Object.values(r as Record<string, unknown>).some((v) => String(v).toLowerCase().includes(termo)),
    );
  }, [registos, pesquisa]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{titulo}</h1>
          <p className="mt-1 max-w-2xl text-sm font-light text-graphite">{descricao}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-graphite ring-1 ring-border">
            {registos.length} {registos.length === 1 ? "registo" : "registos"}
          </span>
          <button
            type="button"
            onClick={() => setEditar({ ...(vazio as object) } as Partial<Registo>)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-95"
          >
            <Plus className="h-4 w-4" /> {rotuloNovo}
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-start gap-6 xl:flex-row">
        {/* Lista */}
        <div className="w-full min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-bold text-foreground">Registos</h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mid-grey" />
              <input
                type="search"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Pesquisar…"
                aria-label="Pesquisar registos"
                className={cn(inputCls, "w-56 pl-9")}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-surface text-[0.68rem] uppercase tracking-wider text-graphite">
                <tr>
                  {colunas.map((c) => (
                    <th key={c} className="px-5 py-3 font-bold">
                      {campos.find((f) => f.nome === c)?.rotulo ?? c}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right font-bold">Acções</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={colunas.length + 1} className="px-5 py-12 text-center text-graphite">
                      A carregar…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={colunas.length + 1} className="px-5 py-12 text-center text-primary">
                      {(error as Error).message}
                    </td>
                  </tr>
                ) : lista.length === 0 ? (
                  <tr>
                    <td colSpan={colunas.length + 1} className="px-5 py-12 text-center text-graphite">
                      Sem registos.
                    </td>
                  </tr>
                ) : (
                  lista.map((registo) => {
                    const id = (registo as { id: string }).id;
                    const activo = id === idActivo;
                    return (
                      <tr
                        key={id}
                        onClick={() => setEditar(registo)}
                        className={cn(
                          "cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-surface",
                          activo && "bg-primary/5",
                        )}
                      >
                        {colunas.map((c, i) => {
                          const valor = (registo as Record<string, unknown>)[c];
                          const eImagem = campos.find((f) => f.nome === c)?.tipo === "imagem";
                          if (eImagem) {
                            return (
                              <td key={c} className={cn("px-5 py-3", activo && i === 0 && "border-l-2 border-primary")}>
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
                            <td
                              key={c}
                              className={cn(
                                "max-w-[20rem] truncate px-5 py-3 text-foreground",
                                i === 0 && "font-medium",
                                activo && i === 0 && "border-l-2 border-primary",
                              )}
                            >
                              {typeof valor === "boolean" ? (
                                <span
                                  className={cn(
                                    "inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide",
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
                        <td className="whitespace-nowrap px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditar(registo);
                            }}
                            aria-label="Editar"
                            className="mr-1 rounded-md p-2 text-graphite transition-colors hover:bg-surface hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
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
        </div>

        {/* Painel lateral de edição */}
        {editar ? (
          <aside className="w-full shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-lg xl:sticky xl:top-6 xl:w-[26rem]">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {idActivo ? "Editar registo" : rotuloNovo}
                </h2>
                {idActivo ? (
                  <p className="mt-0.5 truncate text-xs font-light text-graphite">ID: {idActivo}</p>
                ) : (
                  <p className="mt-0.5 text-xs font-light text-graphite">Preencha os campos e guarde.</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setEditar(null)}
                aria-label="Fechar painel de edição"
                className="rounded-md p-1 text-graphite transition-colors hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              id="formulario-registo"
              className="max-h-[calc(100vh-16rem)] space-y-4 overflow-y-auto px-5 py-5"
              onSubmit={(e) => {
                e.preventDefault();
                guardar.mutate(editar);
              }}
            >
              {campos.map((campo) => {
                const valor = (editar as Record<string, unknown>)[campo.nome];
                const definir = (v: unknown) =>
                  setEditar(
                    (prev: Partial<Registo> | null) =>
                      ({ ...(prev as object), [campo.nome]: v }) as Partial<Registo>,
                  );
                const id = `campo-${campo.nome}`;
                return (
                  <div key={campo.nome}>
                    <label htmlFor={id} className={rotuloCls}>
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
                        className={cn(inputCls, "resize-y")}
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
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => definir(true)}
                          className={cn(
                            "flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                            valor
                              ? "bg-soft-black text-background"
                              : "border border-border text-graphite hover:bg-surface",
                          )}
                        >
                          Activo
                        </button>
                        <button
                          type="button"
                          onClick={() => definir(false)}
                          className={cn(
                            "flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                            !valor
                              ? "bg-soft-black text-background"
                              : "border border-border text-graphite hover:bg-surface",
                          )}
                        >
                          Inactivo
                        </button>
                      </div>
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
                    {campo.ajuda && campo.tipo !== "imagem" ? (
                      <p className="mt-1 text-xs font-light text-graphite">{campo.ajuda}</p>
                    ) : null}
                  </div>
                );
              })}
            </form>

            <div className="flex gap-3 border-t border-border bg-surface px-5 py-4">
              <button
                type="submit"
                form="formulario-registo"
                disabled={guardar.isPending}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-95 disabled:opacity-60"
              >
                {guardar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Guardar alterações
              </button>
              {idActivo ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Eliminar este registo?")) apagar.mutate(idActivo);
                  }}
                  className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-graphite transition-colors hover:text-primary"
                >
                  Eliminar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditar(null)}
                  className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-graphite transition-colors hover:text-primary"
                >
                  Cancelar
                </button>
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
