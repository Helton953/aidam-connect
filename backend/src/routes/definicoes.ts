import { Router } from "express";
import { z } from "zod";
import {
  gravarDefinicoes,
  lerDefinicoes,
  ocultarSegredos,
} from "../lib/definicoes";
import {
  enviarEmailTeste,
  reiniciarTransportador,
  verificarSmtp,
} from "../lib/email";
import { exigirAdmin } from "../middleware/auth";

export const definicoesRouter = Router();

/** Chaves públicas — expostas ao website sem autenticação. */
const PUBLICAS = [
  "posicionamento",
  "morada",
  "telefone",
  "fax",
  "email",
  "facebook",
  "linkedin",
  "instagram",
  "mapa_embed",
  "quem_somos_resumo",
  "quem_somos_corpo",
  "missao",
  "visao",
  "google_analytics",
  "manutencao",
];

const esquema = z.record(z.string().max(20000));

/** GET /api/definicoes/publicas — usado pelo website institucional. */
definicoesRouter.get("/publicas", async (_req, res, next) => {
  try {
    const todas = await lerDefinicoes();
    const saida: Record<string, string> = {};
    for (const chave of PUBLICAS) if (todas[chave]) saida[chave] = todas[chave];
    res.json(saida);
  } catch (erro) {
    next(erro);
  }
});

/** GET /api/definicoes — protegido: todas as definições (segredos mascarados). */
definicoesRouter.get("/", exigirAdmin, async (_req, res, next) => {
  try {
    res.json(ocultarSegredos(await lerDefinicoes()));
  } catch (erro) {
    next(erro);
  }
});

/** PUT /api/definicoes — protegido: grava um conjunto de chaves. */
definicoesRouter.put("/", exigirAdmin, async (req, res, next) => {
  try {
    const valores = esquema.parse(req.body);
    await gravarDefinicoes(valores);
    reiniciarTransportador();
    res.json(ocultarSegredos(await lerDefinicoes()));
  } catch (erro) {
    next(erro);
  }
});

/** GET /api/definicoes/smtp/verificar — protegido: testa a ligação SMTP. */
definicoesRouter.get("/smtp/verificar", exigirAdmin, async (_req, res, next) => {
  try {
    res.json(await verificarSmtp());
  } catch (erro) {
    next(erro);
  }
});

/** POST /api/definicoes/smtp/teste — protegido: envia um email de teste. */
definicoesRouter.post("/smtp/teste", exigirAdmin, async (req, res, next) => {
  try {
    const { destino } = z
      .object({ destino: z.string().trim().email().max(255).optional() })
      .parse(req.body ?? {});
    const resultado = await enviarEmailTeste(destino);
    res.status(resultado.ok ? 200 : 400).json(resultado);
  } catch (erro) {
    next(erro);
  }
});
