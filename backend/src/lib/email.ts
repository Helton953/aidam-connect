import nodemailer, { type Transporter } from "nodemailer";
import { env } from "./env";

let transportador: Transporter | null = null;

function obterTransportador(): Transporter | null {
  if (!env.smtp.host || !env.smtp.user) return null;
  if (!transportador) {
    transportador = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transportador;
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  const transporte = obterTransportador();
  if (!transporte) {
    console.warn("[email] SMTP não configurado — email não enviado.");
    return false;
  }

  try {
    await transporte.sendMail({
      from: env.emailRemetente,
      to: env.emailDestino,
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
