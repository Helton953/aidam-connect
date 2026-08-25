import { Router } from "express";
import { z, type ZodTypeAny } from "zod";
import { consultar, consultarUm, executar } from "../lib/db";
import { exigirAdmin } from "../middleware/auth";

/**
 * CRUD genérico para os restantes conteúdos geridos no painel:
 * associados, membros dos órgãos sociais e blocos institucionais.
 * A leitura é pública (o website consome-a); a escrita exige admin.
 */

type Recurso = {
  tabela: string;
  campos: string[];
  esquema: z.ZodObject<Record<string, ZodTypeAny>>;
  ordem: string;
};

const RECURSOS: Record<string, Recurso> = {
  associados: {
    tabela: "associados",
    campos: [
      "nome",
      "marcas",
      "categorias",
      "website",
      "descricao",
      "logotipo",
      "ordem",
    ],
    ordem: "ordem ASC, nome ASC",
    esquema: z.object({
      nome: z.string().trim().min(2).max(150),
      marcas: z.string().trim().max(500).default(""),
      categorias: z.string().trim().max(200).default(""),
      website: z.string().trim().max(255).default(""),
      descricao: z.string().trim().max(2000).default(""),
      logotipo: z.string().trim().max(500).default(""),
      ordem: z.coerce.number().int().min(0).max(9999).default(0),
    }),
  },
  orgaos: {
    tabela: "orgaos_sociais",
    campos: ["orgao", "cargo", "nome", "empresa", "linkedin", "ordem"],
    ordem: "orgao ASC, ordem ASC",
    esquema: z.object({
      orgao: z.string().trim().min(2).max(120),
      cargo: z.string().trim().max(120).default(""),
      nome: z.string().trim().min(2).max(150),
      empresa: z.string().trim().max(150).default(""),
      linkedin: z.string().trim().max(255).default(""),
      ordem: z.coerce.number().int().min(0).max(9999).default(0),
    }),
  },
  institucional: {
    tabela: "institucional",
    campos: ["chave", "rotulo", "valor"],
    ordem: "id ASC",
    esquema: z.object({
      chave: z
        .string()
        .trim()
        .min(2)
        .max(80)
        .regex(/^[a-z0-9_]+$/, "Chave inválida (minúsculas, números e _)"),
      rotulo: z.string().trim().min(2).max(150),
      valor: z.string().max(20000).default(""),
    }),
  },
};

export const conteudosRouter = Router();

function obter(nome: string): Recurso | null {
  return Object.prototype.hasOwnProperty.call(RECURSOS, nome)
    ? RECURSOS[nome]!
    : null;
}

conteudosRouter.param("recurso", (req, res, next, nome) => {
  if (!obter(String(nome))) {
    res.status(404).json({ erro: "Recurso desconhecido" });
    return;
  }
  next();
});

/** GET /api/conteudos/:recurso — público. */
conteudosRouter.get("/:recurso", async (req, res, next) => {
  try {
    const r = obter(req.params["recurso"]!)!;
    res.json(
      await consultar(
        `SELECT id, ${r.campos.join(", ")} FROM ${r.tabela} ORDER BY ${r.ordem}`,
      ),
    );
  } catch (erro) {
    next(erro);
  }
});

/** POST /api/conteudos/:recurso — protegido. */
conteudosRouter.post("/:recurso", exigirAdmin, async (req, res, next) => {
  try {
    const r = obter(req.params["recurso"]!)!;
    const dados = r.esquema.parse(req.body) as Record<string, unknown>;
    const valores = r.campos.map((c) => dados[c] ?? "");
    const resultado = await executar(
      `INSERT INTO ${r.tabela} (${r.campos.join(", ")})
       VALUES (${r.campos.map(() => "?").join(", ")})`,
      valores,
    );
    res.status(201).json(
      await consultarUm(
        `SELECT id, ${r.campos.join(", ")} FROM ${r.tabela} WHERE id = ?`,
        [resultado.insertId],
      ),
    );
  } catch (erro) {
    next(erro);
  }
});

/** PUT /api/conteudos/:recurso/:id — protegido. */
conteudosRouter.put("/:recurso/:id", exigirAdmin, async (req, res, next) => {
  try {
    const r = obter(req.params["recurso"]!)!;
    const id = Number(req.params["id"]);
    if (!Number.isInteger(id)) {
      res.status(400).json({ erro: "Identificador inválido" });
      return;
    }

    const dados = r.esquema.partial().parse(req.body) as Record<
      string,
      unknown
    >;
    const colunas: string[] = [];
    const valores: unknown[] = [];
    for (const campo of r.campos) {
      if (dados[campo] === undefined) continue;
      colunas.push(`${campo} = ?`);
      valores.push(dados[campo]);
    }
    if (colunas.length === 0) {
      res.status(400).json({ erro: "Nenhum campo para actualizar" });
      return;
    }

    valores.push(id);
    const resultado = await executar(
      `UPDATE ${r.tabela} SET ${colunas.join(", ")} WHERE id = ?`,
      valores,
    );
    if (resultado.affectedRows === 0) {
      res.status(404).json({ erro: "Registo não encontrado" });
      return;
    }
    res.json(
      await consultarUm(
        `SELECT id, ${r.campos.join(", ")} FROM ${r.tabela} WHERE id = ?`,
        [id],
      ),
    );
  } catch (erro) {
    next(erro);
  }
});

/** DELETE /api/conteudos/:recurso/:id — protegido. */
conteudosRouter.delete("/:recurso/:id", exigirAdmin, async (req, res, next) => {
  try {
    const r = obter(req.params["recurso"]!)!;
    const id = Number(req.params["id"]);
    const resultado = await executar(`DELETE FROM ${r.tabela} WHERE id = ?`, [
      id,
    ]);
    if (resultado.affectedRows === 0) {
      res.status(404).json({ erro: "Registo não encontrado" });
      return;
    }
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
});
