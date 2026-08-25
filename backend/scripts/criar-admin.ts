/**
 * Cria (ou actualiza) um administrador do painel.
 *
 * Utilização:
 *   npx tsx scripts/criar-admin.ts "Nome" admin@aidam.co.mz "PalavraPasseForte"
 */
import bcrypt from "bcryptjs";
import { executar, pool } from "../src/lib/db";

async function principal() {
  const [nome, email, password] = process.argv.slice(2);
  if (!nome || !email || !password) {
    console.error(
      'Utilização: npx tsx scripts/criar-admin.ts "Nome" email@dominio "PalavraPasse"',
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("A palavra-passe deve ter pelo menos 8 caracteres.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  await executar(
    `INSERT INTO admins (nome, email, palavra_passe)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE nome = VALUES(nome), palavra_passe = VALUES(palavra_passe), activo = 1`,
    [nome, email.toLowerCase(), hash],
  );

  console.log(`Administrador pronto: ${email}`);
  await pool.end();
}

void principal();
