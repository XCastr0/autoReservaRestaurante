import "dotenv/config";

export const env = {
  apiUrl: process.env.BASE_URL_API ?? "http://localhost:3030",
} as const;
