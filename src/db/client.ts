import { Client } from "pg";
import { env } from "../../config/env";

export async function createDbClient() {
  const client = new Client({
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
  });

  await client.connect();
  return client;
}
