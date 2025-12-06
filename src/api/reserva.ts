import type { APIRequestContext, APIResponse } from "@playwright/test";
import { endpoints } from "./endpoints";
import type {
  NovaReservaPayload,
  AtualizarReservaPayload,
} from "./factories/reserva.factory";

export function criarReserva(
  api: APIRequestContext,
  payload: NovaReservaPayload
): Promise<APIResponse> {
  return api.post(endpoints.reservas.criar, { data: payload });
}

export function listarReservas(api: APIRequestContext): Promise<APIResponse> {
  return api.get(endpoints.reservas.listar);
}

export function deletarReserva(
  api: APIRequestContext,
  id: number | string
): Promise<APIResponse> {
  return api.delete(endpoints.reservas.deletar(id));
}

export function atualizarReserva(
  api: APIRequestContext,
  id: number | string,
  payload: AtualizarReservaPayload
): Promise<APIResponse> {
  return api.patch(endpoints.reservas.atualizar(id), { data: payload });
}

export function verificarReservasProximas(
  api: APIRequestContext,
  payload: any 
): Promise<APIResponse> {
  return api.post(endpoints.reservas.verificarProximas, { data: payload });
}

export function confirmarReserva(
  api: APIRequestContext,
  id: number | string,
  payload?: any 
): Promise<APIResponse> {
  return api.patch(endpoints.reservas.confirmar(id), payload ? { data: payload } : undefined);
}
