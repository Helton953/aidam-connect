import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { consultar, executar } from "../lib/db";
import { exigirAdmin } from "../middleware/auth";

/**
 * Biblioteca de ficheiros: carregamento de imagens a partir do dispositivo.
 * Os ficheiros são gravados em `backend/uploads/` e servidos estaticamente
 * em `/uploads/<ficheiro>` (ver app.ts).
 */

export const PASTA_UPLOADS = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(PASTA_UPLOADS, { recursive: true });

const TIPOS = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
  ["application/pdf", ".pdf"],
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _ficheiro, cb) => cb(null, PASTA_UPLOADS),
    filename: (_req, ficheiro, cb) => {
      const extensao = TIPOS.get(ficheiro.mimetype) ?? ".bin";
      const base = path
        .basename(ficheiro.originalname, path.extname(ficheiro.originalname))
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);
      cb(null, `${base || "ficheiro"}-${crypto.randomBytes(6).toString("hex")}${extensao}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, ficheiro, cb) => {
    if (!TIPOS.has(ficheiro.mimetype)) {
      cb(new Error("Tipo de ficheiro não permitido (JPG, PNG, WEBP, GIF, SVG ou PDF)"));
      return;
    }
    cb(null, true);
  },
});

export const uploadsRouter = Router();

function urlPublica(req: { protocol: string; get: (h: string) => string | undefined }, nome: string) {
  const base = process.env["URL_PUBLICA"]?.replace(/\/$/, "");
  const origem = base || `${req.protocol}://${req.get("host") ?? "localhost"}`;
  return `${origem}/uploads/${nome}`;
}

/** POST /api/uploads — protegido: recebe um ficheiro (campo `ficheiro`). */
uploadsRouter.post("/", exigirAdmin, (req, res, next) => {
  upload.single("ficheiro")(req, res, async (erro) => {
    if (erro) {
      res.status(400).json({ erro: erro.message });
      return;
    }
    const ficheiro = req.file;
    if (!ficheiro) {
      res.status(400).json({ erro: "Nenhum ficheiro recebido" });
      return;
    }

    try {
      const url = urlPublica(req, ficheiro.filename);
      await executar(
        `INSERT INTO ficheiros (nome, nome_original, tipo, tamanho, url, admin_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          ficheiro.filename,
          ficheiro.originalname.slice(0, 255),
          ficheiro.mimetype,
          ficheiro.size,
          url,
          req.admin ? Number(req.admin.sub) : null,
        ],
      );
      res.status(201).json({ url, nome: ficheiro.filename, tamanho: ficheiro.size });
    } catch (e) {
      next(e);
    }
  });
});

/** GET /api/uploads — protegido: biblioteca de ficheiros. */
uploadsRouter.get("/", exigirAdmin, async (_req, res, next) => {
  try {
    res.json(
      await consultar(
        `SELECT id, nome, nome_original, tipo, tamanho, url, criado_em
         FROM ficheiros ORDER BY criado_em DESC LIMIT 200`,
      ),
    );
  } catch (erro) {
    next(erro);
  }
});

/** DELETE /api/uploads/:id — protegido: remove do disco e da base de dados. */
uploadsRouter.delete("/:id", exigirAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params["id"]);
    const [linha] = await consultar<{ nome: string }>(
      "SELECT nome FROM ficheiros WHERE id = ? LIMIT 1",
      [id],
    );
    if (!linha) {
      res.status(404).json({ erro: "Ficheiro não encontrado" });
      return;
    }
    await fs.promises
      .unlink(path.join(PASTA_UPLOADS, linha.nome))
      .catch(() => undefined);
    await executar("DELETE FROM ficheiros WHERE id = ?", [id]);
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
});
