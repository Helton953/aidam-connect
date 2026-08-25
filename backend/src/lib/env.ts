import dotenv from "dotenv";

dotenv.config();

function obrigatorio(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente em falta: ${nome}`);
  }
  return valor;
}

function opcional(nome: string, omissao: string): string {
  return process.env[nome] ?? omissao;
}

export const env = {
  porta: Number(opcional("PORT", "3000")),

  db: {
    host: obrigatorio("DB_HOST"),
    user: obrigatorio("DB_USER"),
    password: process.env["DB_PASS"] ?? "",
    database: obrigatorio("DB_NAME"),
    port: Number(opcional("DB_PORT", "3306")),
  },

  jwtSecret: obrigatorio("JWT_SECRET"),
  jwtExpira: opcional("JWT_EXPIRA", "12h"),

  smtp: {
    host: opcional("SMTP_HOST", ""),
    port: Number(opcional("SMTP_PORT", "465")),
    secure: opcional("SMTP_SECURE", "true") === "true",
    user: opcional("SMTP_USER", ""),
    pass: opcional("SMTP_PASS", ""),
  },

  emailDestino: opcional("EMAIL_DESTINO", process.env["SMTP_USER"] ?? ""),
  emailRemetente: opcional(
    "EMAIL_REMETENTE",
    process.env["SMTP_USER"] ?? "no-reply@localhost",
  ),

  corsOrigens: opcional("CORS_ORIGEM", "http://localhost:8080")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
};
