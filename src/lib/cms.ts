/**
 * Camada de acesso do painel de administração.
 *
 * - Se `VITE_API_URL` estiver definido, todas as operações são feitas contra a
 *   API REST própria (PHP + MySQL em aidam.co.mz) — ver `backend/`.
 * - Caso contrário, o painel funciona em modo local de demonstração
 *   (localStorage), permitindo validar o CMS antes de ligar o servidor.
 */
import { noticias } from "@/data/noticias";
import { associados } from "@/data/associados";
import { orgaosSociais } from "@/data/orgaos-sociais";
import { organizacao, quemSomos, missaoVisaoValores } from "@/data/institucional";
import type {
  AssociadoCms,
  InstitucionalCms,
  MembroCms,
  MensagemCms,
  NoticiaCms,
  RecursoCms,
  RegistoPorRecurso,
  UtilizadorCms,
} from "./cms-types";

export const API_URL: string = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "";
export const modoLocal = API_URL === "";

const TOKEN_KEY = "aidam.cms.token";
const STORE_KEY = "aidam.cms.store";
const UTILIZADOR_DEMO = { email: "admin@aidam.co.mz", palavraPasse: "aidam2026" };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

/* ------------------------------------------------------------------ */
/* Estado local (modo demonstração)                                    */
/* ------------------------------------------------------------------ */

type Store = {
  noticias: NoticiaCms[];
  associados: AssociadoCms[];
  orgaos: MembroCms[];
  institucional: InstitucionalCms[];
  mensagens: MensagemCms[];
};

function novoId() {
  return Math.random().toString(36).slice(2, 10);
}

function estadoInicial(): Store {
  return {
    noticias: noticias.map((n, i) => ({
      id: `n${i + 1}`,
      slug: n.slug,
      titulo: n.titulo,
      data: n.data,
      categoria: n.categoria,
      resumo: n.resumo,
      imagem: typeof n.imagem === "string" ? n.imagem : "",
      imagemAlt: n.imagemAlt,
      corpo: n.corpo.join("\n\n"),
      publicada: true,
    })),
    associados: associados.map((a, i) => ({
      id: a.id,
      nome: a.nome,
      marcas: a.marcas.join(", "),
      categorias: a.categorias.join(","),
      website: a.website,
      descricao: a.descricao,
      logotipo: a.logotipo ?? "",
      ordem: i + 1,
    })),
    orgaos: orgaosSociais.flatMap((o) =>
      o.membros.map((m, i) => ({
        id: novoId(),
        orgao: o.nome,
        cargo: m.cargo,
        nome: m.nome,
        empresa: m.empresa,
        linkedin: m.linkedin ?? "",
        ordem: i + 1,
      })),
    ),
    institucional: [
      { id: "i1", chave: "posicionamento", rotulo: "Frase de posicionamento", valor: organizacao.posicionamento },
      { id: "i2", chave: "morada", rotulo: "Morada", valor: organizacao.morada },
      { id: "i3", chave: "telefone", rotulo: "Telefone", valor: organizacao.telefone },
      { id: "i4", chave: "fax", rotulo: "Fax", valor: organizacao.fax },
      { id: "i5", chave: "email", rotulo: "E-mail", valor: organizacao.email },
      { id: "i6", chave: "quem_somos_resumo", rotulo: "Quem Somos (resumo)", valor: quemSomos.resumo },
      { id: "i7", chave: "quem_somos_corpo", rotulo: "Quem Somos (corpo)", valor: quemSomos.paragrafos.join("\n\n") },
      { id: "i8", chave: "missao", rotulo: "Missão", valor: missaoVisaoValores.missao },
      { id: "i9", chave: "visao", rotulo: "Visão", valor: missaoVisaoValores.visao },
    ],
    mensagens: [],
  };
}

function lerStore(): Store {
  if (typeof window === "undefined") return estadoInicial();
  const bruto = window.localStorage.getItem(STORE_KEY);
  if (!bruto) {
    const inicial = estadoInicial();
    window.localStorage.setItem(STORE_KEY, JSON.stringify(inicial));
    return inicial;
  }
  try {
    return { ...estadoInicial(), ...(JSON.parse(bruto) as Store) };
  } catch {
    return estadoInicial();
  }
}

function gravarStore(store: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

/* ------------------------------------------------------------------ */
/* Cliente HTTP                                                        */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {}

async function pedido<T>(caminho: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const resposta = await fetch(`${API_URL.replace(/\/$/, "")}${caminho}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (resposta.status === 401) {
    setToken(null);
    throw new ApiError("Sessão expirada. Inicie sessão novamente.");
  }
  if (!resposta.ok) {
    let detalhe = `Erro ${resposta.status}`;
    try {
      const corpo = (await resposta.json()) as { erro?: string };
      if (corpo.erro) detalhe = corpo.erro;
    } catch {
      /* resposta sem JSON */
    }
    throw new ApiError(detalhe);
  }
  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}

/* ------------------------------------------------------------------ */
/* Autenticação                                                        */
/* ------------------------------------------------------------------ */

export async function entrar(email: string, palavraPasse: string): Promise<UtilizadorCms> {
  if (modoLocal) {
    if (email.trim().toLowerCase() !== UTILIZADOR_DEMO.email || palavraPasse !== UTILIZADOR_DEMO.palavraPasse) {
      throw new ApiError("Credenciais inválidas.");
    }
    setToken("demo");
    return { id: "demo", nome: "Administrador", email: UTILIZADOR_DEMO.email };
  }
  const dados = await pedido<{ token: string; utilizador: UtilizadorCms }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, palavra_passe: palavraPasse }),
  });
  setToken(dados.token);
  return dados.utilizador;
}

export async function sessaoActual(): Promise<UtilizadorCms | null> {
  if (!getToken()) return null;
  if (modoLocal) return { id: "demo", nome: "Administrador", email: UTILIZADOR_DEMO.email };
  try {
    return await pedido<UtilizadorCms>("/auth/me");
  } catch {
    return null;
  }
}

export async function sair(): Promise<void> {
  if (!modoLocal) {
    try {
      await pedido<void>("/auth/logout", { method: "POST" });
    } catch {
      /* sessão já inválida */
    }
  }
  setToken(null);
}

/* ------------------------------------------------------------------ */
/* CRUD genérico                                                       */
/* ------------------------------------------------------------------ */

export async function listar<R extends RecursoCms>(recurso: R): Promise<RegistoPorRecurso[R][]> {
  if (modoLocal) return lerStore()[recurso] as RegistoPorRecurso[R][];
  return pedido<RegistoPorRecurso[R][]>(`/${recurso}`);
}

export async function criar<R extends RecursoCms>(
  recurso: R,
  registo: Omit<RegistoPorRecurso[R], "id">,
): Promise<RegistoPorRecurso[R]> {
  if (modoLocal) {
    const store = lerStore();
    const novo = { ...(registo as object), id: novoId() } as RegistoPorRecurso[R];
    (store[recurso] as RegistoPorRecurso[R][]).unshift(novo);
    gravarStore(store);
    return novo;
  }
  return pedido<RegistoPorRecurso[R]>(`/${recurso}`, { method: "POST", body: JSON.stringify(registo) });
}

export async function actualizar<R extends RecursoCms>(
  recurso: R,
  id: string,
  registo: Partial<RegistoPorRecurso[R]>,
): Promise<RegistoPorRecurso[R]> {
  if (modoLocal) {
    const store = lerStore();
    const lista = store[recurso] as RegistoPorRecurso[R][];
    const indice = lista.findIndex((r) => (r as { id: string }).id === id);
    if (indice === -1) throw new ApiError("Registo não encontrado.");
    lista[indice] = { ...lista[indice], ...registo } as RegistoPorRecurso[R];
    gravarStore(store);
    return lista[indice] as RegistoPorRecurso[R];
  }
  return pedido<RegistoPorRecurso[R]>(`/${recurso}/${id}`, { method: "PUT", body: JSON.stringify(registo) });
}

export async function remover(recurso: RecursoCms, id: string): Promise<void> {
  if (modoLocal) {
    const store = lerStore();
    store[recurso] = (store[recurso] as { id: string }[]).filter((r) => r.id !== id) as never;
    gravarStore(store);
    return;
  }
  await pedido<void>(`/${recurso}/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/* Formulário público de contacto                                      */
/* ------------------------------------------------------------------ */

export async function enviarMensagem(dados: Omit<MensagemCms, "id" | "criadaEm" | "lida">): Promise<void> {
  if (modoLocal) {
    const store = lerStore();
    store.mensagens.unshift({ ...dados, id: novoId(), criadaEm: new Date().toISOString(), lida: false });
    gravarStore(store);
    return;
  }
  const resposta = await fetch(`${API_URL.replace(/\/$/, "")}/mensagens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) throw new ApiError("Não foi possível enviar a mensagem.");
}

export function gerarSlug(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type { AssociadoCms, InstitucionalCms, MembroCms, MensagemCms, NoticiaCms, UtilizadorCms };
