import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

export type AdminToken = {
  sub: string;
  email: string;
  nome: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminToken;
    }
  }
}

export function assinarToken(admin: AdminToken): string {
  return jwt.sign(admin, env.jwtSecret, {
    expiresIn: env.jwtExpira,
  } as jwt.SignOptions);
}

/** Protege as rotas de escrita: exige um JWT válido de administrador. */
export function exigirAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const cabecalho = req.headers.authorization ?? "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;

  if (!token) {
    res.status(401).json({ erro: "Não autenticado" });
    return;
  }

  try {
    req.admin = jwt.verify(token, env.jwtSecret) as AdminToken;
    next();
  } catch {
    res.status(401).json({ erro: "Sessão inválida ou expirada" });
  }
}
