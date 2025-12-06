import "dotenv/config";

function mustGet(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  apiUrl: process.env.BASE_URL_API ?? "http://localhost:3030",
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? "5432"),
    name: process.env.DB_NAME ?? "restaurante",
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "1234",
  },
} as const;
