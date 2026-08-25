import nodemailer, { type Transporter } from "nodemailer";
import { configSmtp, type ConfigSmtp } from "./definicoes";

/**
 * Transportador SMTP construído a partir das definições guardadas no painel
 * (com reserva para as variáveis do .env). É recriado sempre que a
 * configuração muda.
 */
let transportador: Transporter | null = null;
let assinatura = "";

function assinar(cfg: ConfigSmtp): string {
  return [cfg.host, cfg.port, cfg.secure, cfg.user, cfg.pass].join("|");
}

async function obterTransportador(): Promise<{
  transporte: Transporter | null;
  cfg: ConfigSmtp;
}> {
  const cfg = await configSmtp();
  if (!cfg.host || !cfg.user) return { transporte: null, cfg };

  const nova = assinar(cfg);
  if (!transportador || nova !== assinatura) {
    transportador = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
    });
    assinatura = nova;
  }
  return { transporte: transportador, cfg };
}

export function reiniciarTransportador(): void {
  transportador = null;
  assinatura = "";
}

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Verifica a ligação ao servidor SMTP e devolve o resultado. */
export async function verificarSmtp(): Promise<{
  ok: boolean;
  configurado: boolean;
  erro?: string;
}> {
  const { transporte } = await obterTransportador();
  if (!transporte) return { ok: false, configurado: false };
  try {
    await transporte.verify();
    return { ok: true, configurado: true };
  } catch (erro) {
    return {
      ok: false,
      configurado: true,
      erro: erro instanceof Error ? erro.message : "Falha desconhecida",
    };
  }
}

/** Envia um email de teste para o endereço de destino configurado. */
export async function enviarEmailTeste(
  destino?: string,
): Promise<{ ok: boolean; erro?: string }> {
  const { transporte, cfg } = await obterTransportador();
  if (!transporte) return { ok: false, erro: "SMTP não configurado" };
  try {
    await transporte.sendMail({
      from: cfg.remetente,
      to: destino || cfg.destino || cfg.user,
      subject: "[AIDAM] Teste de configuração SMTP",
      text: "Se recebeu esta mensagem, o envio de email do website AIDAM está a funcionar correctamente.",
    });
    return { ok: true };
  } catch (erro) {
    return {
      ok: false,
      erro: erro instanceof Error ? erro.message : "Falha desconhecida",
    };
  }
}

export type MensagemContacto = {
  nome: string;
  empresa?: string | null;
  email: string;
  assunto: string;
  mensagem: string;
};

/**
 * Envia por email a mensagem recebida no formulário de contacto.
 * Devolve false (sem lançar) se o SMTP não estiver configurado ou falhar,
 * para que a gravação em base de dados não seja perdida.
 */
export async function enviarEmailContacto(
  dados: MensagemContacto,
): Promise<boolean> {
  const { transporte, cfg } = await obterTransportador();
  if (!transporte) {
    console.warn("[email] SMTP não configurado — email não enviado.");
    return false;
  }

  try {
    await transporte.sendMail({
      from: cfg.remetente,
      to: cfg.destino || cfg.user,
      replyTo: dados.email,
      subject: `[Website AIDAM] ${dados.assunto}`,
      text: [
        `Nome: ${dados.nome}`,
        `Empresa: ${dados.empresa ?? "—"}`,
        `E-mail: ${dados.email}`,
        `Assunto: ${dados.assunto}`,
        "",
        dados.mensagem,
      ].join("\n"),
      html: `
        <h2>Nova mensagem do website</h2>
        <p><strong>Nome:</strong> ${escaparHtml(dados.nome)}</p>
        <p><strong>Empresa:</strong> ${escaparHtml(dados.empresa ?? "—")}</p>
        <p><strong>E-mail:</strong> ${escaparHtml(dados.email)}</p>
        <p><strong>Assunto:</strong> ${escaparHtml(dados.assunto)}</p>
        <hr />
        <p>${escaparHtml(dados.mensagem).replace(/\n/g, "<br />")}</p>
      `,
    });
    return true;
  } catch (erro) {
    console.error("[email] Falha ao enviar:", erro);
    return false;
  }
}
