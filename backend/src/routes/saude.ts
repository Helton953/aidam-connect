import { Router } from "express";
import { consultarUm } from "../lib/db";
import { configSmtp } from "../lib/definicoes";

export const saudeRouter = Router();

/**
 * GET /api/health (e /api/saude)
 * Verificação rápida do estado do serviço: processo activo, ligação MySQL
 * e se o SMTP está configurado. Devolve 503 se a base de dados falhar.
 */
saudeRouter.get("/", async (_req, res) => {
  const inicio = Date.now();
  let baseDados: { ok: boolean; latenciaMs?: number; erro?: string } = {
    ok: false,
  };

  try {
    await consultarUm("SELECT 1 AS ok");
    baseDados = { ok: true, latenciaMs: Date.now() - inicio };
  } catch (erro) {
    baseDados = {
      ok: false,
      erro: erro instanceof Error ? erro.message : "Falha na ligação MySQL",
    };
  }

  let smtpConfigurado = false;
  try {
    const cfg = await configSmtp();
    smtpConfigurado = Boolean(cfg.host && cfg.user);
  } catch {
    smtpConfigurado = false;
  }

  res.status(baseDados.ok ? 200 : 503).json({
    ok: baseDados.ok,
    servico: "aidam-api",
    versao: process.env["npm_package_version"] ?? "1.0.0",
    ambiente: process.env["NODE_ENV"] ?? "production",
    node: process.version,
    uptimeSegundos: Math.round(process.uptime()),
    memoriaMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    baseDados,
    smtp: { configurado: smtpConfigurado },
    horaServidor: new Date().toISOString(),
  });
});
