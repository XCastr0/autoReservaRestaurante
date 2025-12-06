import { request, type APIRequestContext } from "@playwright/test";
import { env } from "../../config/env"; // se seu env.ts está em /config/env.ts (raiz)

export async function createApiContext(): Promise<APIRequestContext> {
  return await request.newContext({
    baseURL: env.apiUrl,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  });
}
