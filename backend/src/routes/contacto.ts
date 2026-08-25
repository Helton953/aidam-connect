import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { consultar, executar } from "../lib/db";
import { enviarEmailContacto } from "../lib/email";
import { exigirAdmin } from "../middleware/auth";

export const contactoRouter = Router();

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Demasiadas mensagens enviadas. Tente novamente mais tarde." },
});

const esquemaContacto = z.object({
  nome: z.string().trim().min(2).max(100),
  empresa: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email().max(255),
  assunto: z.string().trim().min(3).max(150),
  mensagem: z.string().trim().min(10).max(2000),
  // Campo honeypot: se vier preenchido, é spam.
  website: z.string().max(0).optional().default(""),
});

/** POST /api/contacto — público: grava na base de dados e envia email. */
contactoRouter.post("/", limitador, async (req, res, next) => {
  try {
    const dados = esquemaContacto.parse(req.body);

    // Honeypot preenchido: responde com sucesso mas descarta.
    if (dados.website) {
      res.status(201).json({ ok: true });
      return;
    }

    const resultado = await executar(
      `INSERT INTO mensagens_contacto (nome, empresa, email, assunto, mensagem, ip)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        dados.nome,
        dados.empresa || null,
        dados.email,
        dados.assunto,
        dados.mensagem,
        req.ip ?? null,
      ],
    );

    const emailEnviado = await enviarEmailContacto(dados);
    if (emailEnviado) {
      await executar(
        "UPDATE mensagens_contacto SET email_enviado = 1 WHERE id = ?",
        [resultado.insertId],
      );
    }

    res.status(201).json({ ok: true, id: resultado.insertId, emailEnviado });
  } catch (erro) {
    next(erro);
  }
});

/** GET /api/contacto — protegido: caixa de entrada do painel. */
contactoRouter.get("/", exigirAdmin, async (_req, res, next) => {
  try {
    res.json(
      await consultar(
        `SELECT id, nome, empresa, email, assunto, mensagem, lida, email_enviado, criado_em
         FROM mensagens_contacto ORDER BY criado_em DESC`,
      ),
    );
  } catch (erro) {
    next(erro);
  }
});

/** PUT /api/contacto/:id — protegido: marcar como lida/não lida. */
contactoRouter.put("/:id", exigirAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { lida } = z.object({ lida: z.boolean() }).parse(req.body);
    const resultado = await executar(
      "UPDATE mensagens_contacto SET lida = ? WHERE id = ?",
      [lida ? 1 : 0, id],
    );
    if (resultado.affectedRows === 0) {
      res.status(404).json({ erro: "Mensagem não encontrada" });
      return;
    }
    res.json({ ok: true });
  } catch (erro) {
    next(erro);
  }
});

/** DELETE /api/contacto/:id — protegido. */
contactoRouter.delete("/:id", exigirAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const resultado = await executar(
      "DELETE FROM mensagens_contacto WHERE id = ?",
      [id],
    );
    if (resultado.affectedRows === 0) {
      res.status(404).json({ erro: "Mensagem não encontrada" });
      return;
    }
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
});
