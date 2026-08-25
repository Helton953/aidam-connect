import mysql from "mysql2/promise";
import { env } from "./env";

/**
 * Pool de ligações MySQL partilhado por toda a aplicação.
 * Todas as consultas usam declarações preparadas (placeholders `?`).
 */
export const pool = mysql.createPool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  port: env.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4_unicode_ci",
  dateStrings: true,
});

export async function consultar<T = any>(
  sql: string,
  valores: unknown[] = [],
): Promise<T[]> {
  const [linhas] = await pool.query(sql, valores);
  return linhas as T[];
}

export async function consultarUm<T = any>(
  sql: string,
  valores: unknown[] = [],
): Promise<T | undefined> {
  const linhas = await consultar<T>(sql, valores);
  return linhas[0];
}

export async function executar(
  sql: string,
  valores: unknown[] = [],
): Promise<mysql.ResultSetHeader> {
  const [resultado] = await pool.execute(sql, valores);
  return resultado as mysql.ResultSetHeader;
}

export async function testarLigacao(): Promise<void> {
  const ligacao = await pool.getConnection();
  try {
    await ligacao.ping();
  } finally {
    ligacao.release();
  }
}
