import { consultar, executar } from "./db";
import { env } from "./env";

/**
 * Definições da plataforma guardadas na tabela `definicoes` (chave/valor).
 * Permitem configurar o site (SMTP, contactos, redes sociais, etc.) a partir
 * do painel de administração, sem editar o ficheiro .env.
 *
 * Os valores do .env continuam a ser usados como valor por omissão quando a
 * chave ainda não existir na base de dados.
 */

export type Definicoes = Record<string, string>;

const CHAVES_SENSIVEIS = new Set(["smtp_pass"]);

let cache: { valor: Definicoes; expira: number } | null = null;
const TTL_MS = 30_000;

export function limparCacheDefinicoes(): void {
  cache = null;
}

export async function lerDefinicoes(): Promise<Definicoes> {
  if (cache && cache.expira > Date.now()) return cache.valor;

  const linhas = await consultar<{ chave: string; valor: string }>(
    "SELECT chave, valor FROM definicoes",
  );
  const valor: Definicoes = {};
  for (const linha of linhas) valor[linha.chave] = linha.valor ?? "";

  cache = { valor, expira: Date.now() + TTL_MS };
  return valor;
}

/** Versão pública: nunca inclui segredos (palavras-passe, chaves). */
export function ocultarSegredos(definicoes: Definicoes): Definicoes {
  const saida: Definicoes = {};
  for (const [chave, valor] of Object.entries(definicoes)) {
    saida[chave] = CHAVES_SENSIVEIS.has(chave) ? (valor ? "********" : "") : valor;
  }
  return saida;
}

export async function gravarDefinicoes(valores: Definicoes): Promise<void> {
  for (const [chave, valor] of Object.entries(valores)) {
    // Valor mascarado devolvido pelo painel: não sobrepõe o segredo guardado.
    if (CHAVES_SENSIVEIS.has(chave) && valor === "********") continue;
    await executar(
      `INSERT INTO definicoes (chave, valor) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
      [chave, valor ?? ""],
    );
  }
  limparCacheDefinicoes();
}

export type ConfigSmtp = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  remetente: string;
  destino: string;
};

/** Configuração SMTP efectiva: base de dados primeiro, .env como reserva. */
export async function configSmtp(): Promise<ConfigSmtp> {
  let guardadas: Definicoes = {};
  try {
    guardadas = await lerDefinicoes();
  } catch {
    /* base de dados indisponível — usa apenas o .env */
  }

  const texto = (chave: string, omissao: string) =>
    (guardadas[chave] ?? "").trim() || omissao;

  return {
    host: texto("smtp_host", env.smtp.host),
    port: Number(texto("smtp_port", String(env.smtp.port))) || 465,
    secure: texto("smtp_secure", env.smtp.secure ? "true" : "false") === "true",
    user: texto("smtp_user", env.smtp.user),
    pass: texto("smtp_pass", env.smtp.pass),
    remetente: texto("email_remetente", env.emailRemetente),
    destino: texto("email_destino", env.emailDestino),
  };
}
