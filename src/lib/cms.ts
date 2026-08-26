/**
 * Camada de acesso do painel de administração.
 *
 * - Se `VITE_API_URL` estiver definido, todas as operações são feitas contra a
 *   API REST própria (Node.js + Express + MySQL em aidam.co.mz) — ver `backend/`.
 * - Caso contrário, o painel funciona em modo local de demonstração
 *   (localStorage), permitindo validar o CMS antes de ligar o servidor.
 */
import { organizacao, quemSomos, missaoVisaoValores } from "@/data/institucional";
import type {
  AdministradorCms,
  AssociadoCms,
  DefinicoesCms,
  EstadoServico,
  FicheiroCms,
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
  definicoes: DefinicoesCms;
  ficheiros: FicheiroCms[];
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
    definicoes: {
      morada: organizacao.morada,
      telefone: organizacao.telefone,
      email: organizacao.email,
      smtp_host: "",
      smtp_port: "465",
      smtp_secure: "true",
      smtp_user: "",
      smtp_pass: "",
      email_destino: organizacao.email,
      email_remetente: `Website AIDAM <${organizacao.email}>`,
    },
    ficheiros: [],
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

const base = () => API_URL.replace(/\/$/, "");

async function pedido<T>(caminho: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const resposta = await fetch(`${base()}${caminho}`, {
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
/* Mapeamento entre a API (snake_case) e o painel (camelCase)          */
/* ------------------------------------------------------------------ */

type Bruto = Record<string, unknown>;

const caminhos: Record<RecursoCms, string> = {
  noticias: "/api/noticias",
  associados: "/api/conteudos/associados",
  orgaos: "/api/conteudos/orgaos",
  institucional: "/api/conteudos/institucional",
  mensagens: "/api/contacto",
};

function daApi(recurso: RecursoCms, linha: Bruto): Bruto {
  const id = String(linha["id"] ?? "");
  if (recurso === "noticias") {
    return {
      id,
      slug: linha["slug"] ?? "",
      titulo: linha["titulo"] ?? "",
      data: String(linha["data"] ?? "").slice(0, 10),
      categoria: linha["categoria"] ?? "Associação",
      resumo: linha["resumo"] ?? "",
      imagem: linha["imagem"] ?? "",
      imagemAlt: linha["imagem_alt"] ?? "",
      corpo: linha["corpo"] ?? "",
      publicada: Boolean(Number(linha["publicada"] ?? 0)),
    };
  }
  if (recurso === "mensagens") {
    return {
      id,
      nome: linha["nome"] ?? "",
      empresa: linha["empresa"] ?? "",
      email: linha["email"] ?? "",
      assunto: linha["assunto"] ?? "",
      mensagem: linha["mensagem"] ?? "",
      criadaEm: linha["criado_em"] ?? "",
      lida: Boolean(Number(linha["lida"] ?? 0)),
    };
  }
  return { ...linha, id };
}

function paraApi(recurso: RecursoCms, registo: Bruto): Bruto {
  const { id: _id, ...resto } = registo;
  if (recurso === "noticias") {
    const saida: Bruto = { ...resto };
    if ("imagemAlt" in saida) {
      saida["imagem_alt"] = saida["imagemAlt"];
      delete saida["imagemAlt"];
    }
    return saida;
  }
  if (recurso === "mensagens") {
    // Apenas o estado de leitura é editável.
    return "lida" in resto ? { lida: Boolean(resto["lida"]) } : {};
  }
  return resto;
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
  const dados = await pedido<{ token: string; admin: UtilizadorCms }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password: palavraPasse }),
  });
  setToken(dados.token);
  return dados.admin;
}

export async function sessaoActual(): Promise<UtilizadorCms | null> {
  if (!getToken()) return null;
  if (modoLocal) return { id: "demo", nome: "Administrador", email: UTILIZADOR_DEMO.email };
  try {
    const dados = await pedido<{ admin: { sub: string; nome: string; email: string } }>("/api/admin/me");
    return { id: dados.admin.sub, nome: dados.admin.nome, email: dados.admin.email };
  } catch {
    return null;
  }
}

export async function sair(): Promise<void> {
  setToken(null);
}

export async function alterarPalavraPasse(actual: string, nova: string): Promise<void> {
  if (modoLocal) throw new ApiError("Indisponível em modo de demonstração.");
  await pedido<void>("/api/admin/password", {
    method: "POST",
    body: JSON.stringify({ actual, nova }),
  });
}

/* ------------------------------------------------------------------ */
/* CRUD genérico                                                       */
/* ------------------------------------------------------------------ */

export async function listar<R extends RecursoCms>(recurso: R): Promise<RegistoPorRecurso[R][]> {
  if (modoLocal) return lerStore()[recurso] as RegistoPorRecurso[R][];
  const sufixo = recurso === "noticias" ? "?todas=1" : "";
  const linhas = await pedido<Bruto[]>(`${caminhos[recurso]}${sufixo}`);
  return linhas.map((l) => daApi(recurso, l)) as RegistoPorRecurso[R][];
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
  const linha = await pedido<Bruto>(caminhos[recurso], {
    method: "POST",
    body: JSON.stringify(paraApi(recurso, registo as Bruto)),
  });
  return daApi(recurso, linha) as RegistoPorRecurso[R];
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
  const linha = await pedido<Bruto>(`${caminhos[recurso]}/${id}`, {
    method: "PUT",
    body: JSON.stringify(paraApi(recurso, registo as Bruto)),
  });
  return (linha ? daApi(recurso, linha) : ({ id, ...registo } as unknown)) as RegistoPorRecurso[R];
}

export async function remover(recurso: RecursoCms, id: string): Promise<void> {
  if (modoLocal) {
    const store = lerStore();
    store[recurso] = (store[recurso] as { id: string }[]).filter((r) => r.id !== id) as never;
    gravarStore(store);
    return;
  }
  await pedido<void>(`${caminhos[recurso]}/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/* Carregamento de ficheiros (imagens a partir do dispositivo)         */
/* ------------------------------------------------------------------ */

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

function paraDataUrl(ficheiro: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = () => reject(new ApiError("Não foi possível ler o ficheiro."));
    leitor.readAsDataURL(ficheiro);
  });
}

export async function carregarFicheiro(ficheiro: File): Promise<FicheiroCms> {
  if (ficheiro.size > TAMANHO_MAXIMO) {
    throw new ApiError("Ficheiro demasiado grande (máximo 5 MB).");
  }

  if (modoLocal) {
    const store = lerStore();
    const registo: FicheiroCms = {
      id: novoId(),
      nome: ficheiro.name,
      nomeOriginal: ficheiro.name,
      tipo: ficheiro.type,
      tamanho: ficheiro.size,
      url: await paraDataUrl(ficheiro),
      criadoEm: new Date().toISOString(),
    };
    store.ficheiros.unshift(registo);
    // Evita rebentar a quota do localStorage com muitas imagens grandes.
    store.ficheiros = store.ficheiros.slice(0, 20);
    gravarStore(store);
    return registo;
  }

  const corpo = new FormData();
  corpo.append("ficheiro", ficheiro);
  const resposta = await fetch(`${base()}/api/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken() ?? ""}` },
    body: corpo,
  });
  if (!resposta.ok) {
    let detalhe = "Não foi possível carregar o ficheiro.";
    try {
      const json = (await resposta.json()) as { erro?: string };
      if (json.erro) detalhe = json.erro;
    } catch {
      /* sem JSON */
    }
    throw new ApiError(detalhe);
  }
  const dados = (await resposta.json()) as { url: string; nome: string; tamanho: number };
  return {
    id: dados.nome,
    nome: dados.nome,
    nomeOriginal: ficheiro.name,
    tipo: ficheiro.type,
    tamanho: dados.tamanho,
    url: dados.url,
    criadoEm: new Date().toISOString(),
  };
}

export async function listarFicheiros(): Promise<FicheiroCms[]> {
  if (modoLocal) return lerStore().ficheiros;
  const linhas = await pedido<Bruto[]>("/api/uploads");
  return linhas.map((l) => ({
    id: String(l["id"]),
    nome: String(l["nome"] ?? ""),
    nomeOriginal: String(l["nome_original"] ?? ""),
    tipo: String(l["tipo"] ?? ""),
    tamanho: Number(l["tamanho"] ?? 0),
    url: String(l["url"] ?? ""),
    criadoEm: String(l["criado_em"] ?? ""),
  }));
}

export async function removerFicheiro(id: string): Promise<void> {
  if (modoLocal) {
    const store = lerStore();
    store.ficheiros = store.ficheiros.filter((f) => f.id !== id);
    gravarStore(store);
    return;
  }
  await pedido<void>(`/api/uploads/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/* Definições da plataforma                                            */
/* ------------------------------------------------------------------ */

export async function lerDefinicoes(): Promise<DefinicoesCms> {
  if (modoLocal) return lerStore().definicoes;
  return pedido<DefinicoesCms>("/api/definicoes");
}

export async function gravarDefinicoes(valores: DefinicoesCms): Promise<DefinicoesCms> {
  if (modoLocal) {
    const store = lerStore();
    store.definicoes = { ...store.definicoes, ...valores };
    gravarStore(store);
    return store.definicoes;
  }
  return pedido<DefinicoesCms>("/api/definicoes", { method: "PUT", body: JSON.stringify(valores) });
}

export async function verificarSmtp(): Promise<{ ok: boolean; configurado: boolean; erro?: string }> {
  if (modoLocal) return { ok: false, configurado: false, erro: "Modo de demonstração." };
  return pedido("/api/definicoes/smtp/verificar");
}

export async function enviarEmailTeste(destino?: string): Promise<{ ok: boolean; erro?: string }> {
  if (modoLocal) return { ok: false, erro: "Modo de demonstração." };
  return pedido("/api/definicoes/smtp/teste", {
    method: "POST",
    body: JSON.stringify(destino ? { destino } : {}),
  });
}

/* ------------------------------------------------------------------ */
/* Administradores e estado do serviço                                 */
/* ------------------------------------------------------------------ */

export async function listarAdministradores(): Promise<AdministradorCms[]> {
  if (modoLocal) {
    return [
      { id: "demo", nome: "Administrador", email: UTILIZADOR_DEMO.email, activo: true, ultimoAcesso: null },
    ];
  }
  const linhas = await pedido<Bruto[]>("/api/admin/utilizadores");
  return linhas.map((l) => ({
    id: String(l["id"]),
    nome: String(l["nome"] ?? ""),
    email: String(l["email"] ?? ""),
    activo: Boolean(Number(l["activo"] ?? 0)),
    ultimoAcesso: (l["ultimo_acesso"] as string | null) ?? null,
  }));
}

export async function criarAdministrador(dados: {
  nome: string;
  email: string;
  password: string;
}): Promise<void> {
  if (modoLocal) throw new ApiError("Indisponível em modo de demonstração.");
  await pedido<void>("/api/admin/utilizadores", { method: "POST", body: JSON.stringify(dados) });
}

export async function actualizarAdministrador(
  id: string,
  dados: { nome?: string; activo?: boolean; password?: string },
): Promise<void> {
  if (modoLocal) throw new ApiError("Indisponível em modo de demonstração.");
  await pedido<void>(`/api/admin/utilizadores/${id}`, { method: "PUT", body: JSON.stringify(dados) });
}

export async function removerAdministrador(id: string): Promise<void> {
  if (modoLocal) throw new ApiError("Indisponível em modo de demonstração.");
  await pedido<void>(`/api/admin/utilizadores/${id}`, { method: "DELETE" });
}

export async function estadoServico(): Promise<EstadoServico> {
  if (modoLocal) {
    return { ok: false, erro: "Modo de demonstração: sem ligação à API." };
  }
  try {
    const resposta = await fetch(`${base()}/api/health`);
    return (await resposta.json()) as EstadoServico;
  } catch (erro) {
    return { ok: false, erro: erro instanceof Error ? erro.message : "Serviço inacessível." };
  }
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
  const resposta = await fetch(`${base()}/api/contacto`, {
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

export type {
  RecursoCms,
  RegistoPorRecurso,
  AdministradorCms,
  AssociadoCms,
  DefinicoesCms,
  EstadoServico,
  FicheiroCms,
  InstitucionalCms,
  MembroCms,
  MensagemCms,
  NoticiaCms,
  UtilizadorCms,
};
