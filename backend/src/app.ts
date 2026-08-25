import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import { ZodError } from "zod";
import { env } from "./lib/env";
import { adminRouter } from "./routes/admin";
import { contactoRouter } from "./routes/contacto";
import { noticiasRouter } from "./routes/noticias";

export function criarApp() {
  const app = express();

  // Necessário no cPanel/Passenger para obter o IP real (rate limiting).
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));

  // CORS restrito aos domínios definidos em CORS_ORIGEM.
  app.use(
    cors({
      origin(origem, callback) {
        // Pedidos sem Origin (curl, servidor-para-servidor) são permitidos.
        if (!origem || env.corsOrigens.includes(origem)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origem não autorizada por CORS"));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400,
    }),
  );

  app.get("/api/saude", (_req, res) => {
    res.json({ ok: true, servico: "aidam-api" });
  });

  app.use("/api/noticias", noticiasRouter);
  app.use("/api/contacto", contactoRouter);
  app.use("/api/admin", adminRouter);

  app.use((_req, res) => {
    res.status(404).json({ erro: "Recurso não encontrado" });
  });

  app.use(
    (erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (erro instanceof ZodError) {
        res.status(400).json({
          erro: "Dados inválidos",
          detalhes: erro.issues.map((i) => ({
            campo: i.path.join("."),
            mensagem: i.message,
          })),
        });
        return;
      }

      if (erro instanceof Error && erro.message.includes("CORS")) {
        res.status(403).json({ erro: "Origem não autorizada" });
        return;
      }

      console.error("[erro]", erro);
      res.status(500).json({ erro: "Erro interno do servidor" });
    },
  );

  return app;
}
