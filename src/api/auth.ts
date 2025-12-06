import type { APIRequestContext, APIResponse } from "@playwright/test";
import { endpoints } from "./endpoints";
import type { NovoUsuarioPayload } from "./factories/usuario.factory";

export function registerUser(
  api: APIRequestContext,
  payload: NovoUsuarioPayload
): Promise<APIResponse> {
  return api.post(endpoints.auth.registro, { data: payload });
}
