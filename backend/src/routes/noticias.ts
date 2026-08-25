import { Router } from "express";
import { z } from "zod";
import { consultar, consultarUm, executar } from "../lib/db";
import { exigirAdmin } from "../middleware/auth";

export const noticiasRouter = Router();

const esquemaNoticia = z.object({
  titulo: z.string().trim().min(3).max(200),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug inválido (apenas minúsculas, números e hífens)"),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data no formato AAAA-MM-DD"),
  categoria: z.enum(["Associação", "Mercado", "Sector", "Eventos"]),
  resumo: z.string().trim().min(10).max(500),
  corpo: z.string().trim().min(10).max(50000),
  imagem: z.string().trim().max(500).optional().default(""),
  imagem_alt: z.string().trim().max(200).optional().default(""),
  publicada: z.boolean().optional().default(true),
});

const esquemaParcial = esquemaNoticia.partial();

const CAMPOS =
  "id, titulo, slug, data, categoria, resumo, corpo, imagem, imagem_alt, publicada, criado_em, actualizado_em";

/** GET /api/noticias — lista pública (só publicadas) ou completa para admin. */
noticiasRouter.get("/", async (req, res, next) => {
  try {
    const incluirRascunhos = req.query["todas"] === "1";
    const sql = incluirRascunhos
      ? `SELECT ${CAMPOS} FROM noticias ORDER BY data DESC, id DESC`
      : `SELECT ${CAMPOS} FROM noticias WHERE publicada = 1 ORDER BY data DESC, id DESC`;
    res.json(await consultar(sql));
  } catch (erro) {
    next(erro);
  }
});

/** GET /api/noticias/:id — aceita id numérico ou slug. */
noticiasRouter.get("/:id", async (req, res, next) => {
  try {
    const chave = req.params.id;
    const porId = /^\d+$/.test(chave);
    const noticia = await consultarUm(
      `SELECT ${CAMPOS} FROM noticias WHERE ${porId ? "id" : "slug"} = ? LIMIT 1`,
      [porId ? Number(chave) : chave],
    );
    if (!noticia) {
      res.status(404).json({ erro: "Notícia não encontrada" });
      return;
    }
    res.json(noticia);
  } catch (erro) {
    next(erro);
  }
});

/** POST /api/noticias — protegido. */
noticiasRouter.post("/", exigirAdmin, async (req, res, next) => {
  try {
    const dados = esquemaNoticia.parse(req.body);
    const existente = await consultarUm(
      "SELECT id FROM noticias WHERE slug = ? LIMIT 1",
      [dados.slug],
    );
    if (existente) {
      res.status(409).json({ erro: "Já existe uma notícia com este slug" });
      return;
    }
    const resultado = await executar(
      `INSERT INTO noticias
         (titulo, slug, data, categoria, resumo, corpo, imagem, imagem_alt, publicada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.titulo,
        dados.slug,
        dados.data,
        dados.categoria,
        dados.resumo,
        dados.corpo,
        dados.imagem,
        dados.imagem_alt,
        dados.publicada ? 1 : 0,
      ],
    );
    const criada = await consultarUm(
      `SELECT ${CAMPOS} FROM noticias WHERE id = ?`,
      [resultado.insertId],
    );
    res.status(201).json(criada);
  } catch (erro) {
    next(erro);
  }
});

/** PUT /api/noticias/:id — protegido. */
noticiasRouter.put("/:id", exigirAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ erro: "Identificador inválido" });
      return;
    }

    const dados = esquemaParcial.parse(req.body);
    const colunas: string[] = [];
    const valores: any[] = [];

    for (const [chave, valor] of Object.entries(dados)) {
      if (valor === undefined) continue;
      colunas.push(`${chave} = ?`);
      valores.push(typeof valor === "boolean" ? (valor ? 1 : 0) : valor);
    }

    if (colunas.length === 0) {
      res.status(400).json({ erro: "Nenhum campo para actualizar" });
      return;
    }

    valores.push(id);
    const resultado = await executar(
      `UPDATE noticias SET ${colunas.join(", ")} WHERE id = ?`,
      valores,
    );
    if (resultado.affectedRows === 0) {
      res.status(404).json({ erro: "Notícia não encontrada" });
      return;
    }

    res.json(
      await consultarUm(`SELECT ${CAMPOS} FROM noticias WHERE id = ?`, [id]),
    );
  } catch (erro) {
    next(erro);
  }
});

/** DELETE /api/noticias/:id — protegido. */
noticiasRouter.delete("/:id", exigirAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ erro: "Identificador inválido" });
      return;
    }
    const resultado = await executar("DELETE FROM noticias WHERE id = ?", [id]);
    if (resultado.affectedRows === 0) {
      res.status(404).json({ erro: "Notícia não encontrada" });
      return;
    }
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
});
