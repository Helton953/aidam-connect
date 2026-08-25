import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { consultar, consultarUm, executar } from "../lib/db";
import { assinarToken, exigirAdmin } from "../middleware/auth";

export const adminRouter = Router();

const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Demasiadas tentativas. Tente novamente mais tarde." },
});

type LinhaAdmin = {
  id: number;
  nome: string;
  email: string;
  palavra_passe: string;
  activo: number;
};

/** POST /api/admin/login — devolve um JWT. */
adminRouter.post("/login", limitadorLogin, async (req, res, next) => {
  try {
    const { email, password } = z
      .object({
        email: z.string().trim().email().max(255),
        password: z.string().min(8).max(200),
      })
      .parse(req.body);

    const admin = await consultarUm<LinhaAdmin>(
      "SELECT id, nome, email, palavra_passe, activo FROM admins WHERE email = ? LIMIT 1",
      [email.toLowerCase()],
    );

    // Mensagem genérica para não revelar se o email existe.
    const valido =
      !!admin &&
      admin.activo === 1 &&
      (await bcrypt.compare(password, admin.palavra_passe));

    if (!valido || !admin) {
      res.status(401).json({ erro: "Credenciais inválidas" });
      return;
    }

    await executar("UPDATE admins SET ultimo_acesso = NOW() WHERE id = ?", [
      admin.id,
    ]);

    const token = assinarToken({
      sub: String(admin.id),
      email: admin.email,
      nome: admin.nome,
    });

    res.json({
      token,
      admin: { id: admin.id, nome: admin.nome, email: admin.email },
    });
  } catch (erro) {
    next(erro);
  }
});

/** GET /api/admin/me — valida a sessão actual. */
adminRouter.get("/me", exigirAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

/** POST /api/admin/password — altera a própria palavra-passe. */
adminRouter.post("/password", exigirAdmin, async (req, res, next) => {
  try {
    const { actual, nova } = z
      .object({
        actual: z.string().min(8).max(200),
        nova: z.string().min(8).max(200),
      })
      .parse(req.body);

    const admin = await consultarUm<LinhaAdmin>(
      "SELECT id, palavra_passe FROM admins WHERE id = ? LIMIT 1",
      [Number(req.admin!.sub)],
    );
    if (!admin || !(await bcrypt.compare(actual, admin.palavra_passe))) {
      res.status(401).json({ erro: "Palavra-passe actual incorrecta" });
      return;
    }

    await executar("UPDATE admins SET palavra_passe = ? WHERE id = ?", [
      await bcrypt.hash(nova, 12),
      admin.id,
    ]);
    res.json({ ok: true });
  } catch (erro) {
    next(erro);
  }
});

/* ------------------------------------------------------------------ */
/* Gestão de administradores                                           */
/* ------------------------------------------------------------------ */

/** GET /api/admin/utilizadores — lista de administradores. */
adminRouter.get("/utilizadores", exigirAdmin, async (_req, res, next) => {
  try {
    res.json(
      await consultar(
        "SELECT id, nome, email, activo, ultimo_acesso, criado_em FROM admins ORDER BY id ASC",
      ),
    );
  } catch (erro) {
    next(erro);
  }
});

/** POST /api/admin/utilizadores — cria um novo administrador. */
adminRouter.post("/utilizadores", exigirAdmin, async (req, res, next) => {
  try {
    const dados = z
      .object({
        nome: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(255),
        password: z.string().min(8).max(200),
        activo: z.boolean().optional().default(true),
      })
      .parse(req.body);

    const existente = await consultarUm<{ id: number }>(
      "SELECT id FROM admins WHERE email = ? LIMIT 1",
      [dados.email.toLowerCase()],
    );
    if (existente) {
      res.status(409).json({ erro: "Já existe um administrador com este e-mail" });
      return;
    }

    const resultado = await executar(
      "INSERT INTO admins (nome, email, palavra_passe, activo) VALUES (?, ?, ?, ?)",
      [
        dados.nome,
        dados.email.toLowerCase(),
        await bcrypt.hash(dados.password, 12),
        dados.activo ? 1 : 0,
      ],
    );
    res.status(201).json({ id: resultado.insertId, nome: dados.nome, email: dados.email });
  } catch (erro) {
    next(erro);
  }
});

/** PUT /api/admin/utilizadores/:id — actualiza nome, estado ou palavra-passe. */
adminRouter.put("/utilizadores/:id", exigirAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params["id"]);
    const dados = z
      .object({
        nome: z.string().trim().min(2).max(120).optional(),
        activo: z.boolean().optional(),
        password: z.string().min(8).max(200).optional(),
      })
      .parse(req.body);

    const colunas: string[] = [];
    const valores: unknown[] = [];
    if (dados.nome !== undefined) {
      colunas.push("nome = ?");
      valores.push(dados.nome);
    }
    if (dados.activo !== undefined) {
      colunas.push("activo = ?");
      valores.push(dados.activo ? 1 : 0);
    }
    if (dados.password !== undefined) {
      colunas.push("palavra_passe = ?");
      valores.push(await bcrypt.hash(dados.password, 12));
    }
    if (colunas.length === 0) {
      res.status(400).json({ erro: "Nenhum campo para actualizar" });
      return;
    }

    valores.push(id);
    const resultado = await executar(
      `UPDATE admins SET ${colunas.join(", ")} WHERE id = ?`,
      valores,
    );
    if (resultado.affectedRows === 0) {
      res.status(404).json({ erro: "Administrador não encontrado" });
      return;
    }
    res.json({ ok: true });
  } catch (erro) {
    next(erro);
  }
});

/** DELETE /api/admin/utilizadores/:id — não permite eliminar a própria conta. */
adminRouter.delete("/utilizadores/:id", exigirAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params["id"]);
    if (String(id) === req.admin!.sub) {
      res.status(400).json({ erro: "Não pode eliminar a sua própria conta" });
      return;
    }
    const resultado = await executar("DELETE FROM admins WHERE id = ?", [id]);
    if (resultado.affectedRows === 0) {
      res.status(404).json({ erro: "Administrador não encontrado" });
      return;
    }
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
});

/** GET /api/admin/estatisticas — indicadores do painel. */
adminRouter.get("/estatisticas", exigirAdmin, async (_req, res, next) => {
  try {
    const [noticias, mensagens, associados, orgaos, ficheiros] = await Promise.all([
      consultarUm<{ total: number; publicadas: number }>(
        "SELECT COUNT(*) AS total, SUM(publicada = 1) AS publicadas FROM noticias",
      ),
      consultarUm<{ total: number; porLer: number }>(
        "SELECT COUNT(*) AS total, SUM(lida = 0) AS porLer FROM mensagens_contacto",
      ),
      consultarUm<{ total: number }>("SELECT COUNT(*) AS total FROM associados"),
      consultarUm<{ total: number }>("SELECT COUNT(*) AS total FROM orgaos_sociais"),
      consultarUm<{ total: number }>("SELECT COUNT(*) AS total FROM ficheiros"),
    ]);
    res.json({ noticias, mensagens, associados, orgaos, ficheiros });
  } catch (erro) {
    next(erro);
  }
});
