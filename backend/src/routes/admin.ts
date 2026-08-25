import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { consultarUm, executar } from "../lib/db";
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
