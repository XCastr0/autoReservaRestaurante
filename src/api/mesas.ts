import type { APIRequestContext, APIResponse } from "@playwright/test";
import { endpoints } from "./endpoints";
import type { NovaMesaPayload, AtualizarMesaPayload } from "./factories/mesa.factory";

export function criarMesa(
  api: APIRequestContext,
  payload: NovaMesaPayload
): Promise<APIResponse> {
  return api.post(endpoints.mesas.criar, { data: payload });
}

export function listarMesas(api: APIRequestContext): Promise<APIResponse> {
  return api.get(endpoints.mesas.listar);
}

export function atualizarMesa(
  api: APIRequestContext,
  id: number | string,
  payload: AtualizarMesaPayload
): Promise<APIResponse> {
  return api.patch(endpoints.mesas.atualizar(id), { data: payload });
}
