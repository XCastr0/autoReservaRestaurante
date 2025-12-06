import { createDbClient } from "../db/client";


export async function cleanupMesaByNumero(numeroMesa: number) {
  const db = await createDbClient();
  try {
    await db.query(`DELETE FROM "Mesa" WHERE "numeroMesa" = $1`, [numeroMesa]);
  } finally {
    await db.end();
  }
}

export async function deleteBy(table: string, column: string, value: string | number) {
  const db = await createDbClient();
  try {
    await db.query(`DELETE FROM "${table}" WHERE "${column}" = $1`, [value]);
  } finally {
    await db.end();
  }
}