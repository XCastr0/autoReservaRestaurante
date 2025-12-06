import { createDbClient } from "../db/client";


export async function cleanupMesaByNumero(numeroMesa: number) {
  const db = await createDbClient();
  try {
    await db.query(`DELETE FROM "Mesa" WHERE "numeroMesa" = $1`, [numeroMesa]);
  } finally {
    await db.end();
  }
}