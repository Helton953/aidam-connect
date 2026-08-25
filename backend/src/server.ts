import { criarApp } from "./app";
import { testarLigacao } from "./lib/db";
import { env } from "./lib/env";

async function arrancar() {
  try {
    await testarLigacao();
    console.log("[db] Ligação MySQL estabelecida.");
  } catch (erro) {
    console.error("[db] Falha na ligação MySQL:", erro);
  }

  criarApp().listen(env.porta, () => {
    console.log(`[api] AIDAM a escutar na porta ${env.porta}`);
  });
}

void arrancar();
