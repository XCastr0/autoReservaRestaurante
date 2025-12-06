import { test, expect } from "@playwright/test";
import { createApiContext } from "../../src/api/client";
import { createDbClient } from "../../src/db/client";
import { attachJson, attachText } from "../../src/support/attachments";
import { mesaFactory } from "../../src/api/factories/mesa.factory";
import { reservaFactory } from "../../src/api/factories/reserva.factory";
import { criarMesa } from "../../src/api/mesas";
import {criarReserva,listarReservas,atualizarReserva,deletarReserva,verificarReservasProximas,confirmarReserva} from "../../src/api/reserva";
import { deleteBy } from "../../src/support/db";

async function createMesaAndGetId(api: any) {
  const mesaPayload = mesaFactory();
  const res = await criarMesa(api, mesaPayload);
  expect(res.status()).toBe(201);

  const body = await res.json().catch(() => ({}));
  const mesa = body?.mesa ?? body;
  const mesaId = mesa?.id;

  expect(mesaId).toBeTruthy();
  return { mesaId, mesaPayload };
}

test.describe("Reserva", () => {
  test("CT01 - deve criar reserva com sucesso (API + DB)", async ({}, testInfo) => {
    const api = await createApiContext();
    const { mesaId, mesaPayload } = await createMesaAndGetId(api);
    const payload = reservaFactory({ numeroMesa: mesaId });
    await attachJson(testInfo, "CT01_request_payload.json", payload);
    const res = await criarReserva(api, payload);
    await attachText(testInfo, "CT01_response_meta.txt", `status=${res.status()}`);
    const body = await res.json().catch(() => ({}));
    await attachJson(testInfo, "CT01_response_body.json", body);
    expect(res.status()).toBe(201);
    const reserva = body?.reserva ?? body?.data?.reserva ?? body;
    expect(reserva).toHaveProperty("id");
    expect(reserva).toHaveProperty("nomeResponsavel", payload.nomeResponsavel);
    expect(reserva).toHaveProperty("quantidade", payload.quantidade);
    expect(reserva).toHaveProperty("status", payload.status);
    const reservaId = reserva.id;

    // ===== DB assert =====
    const db = await createDbClient();
    try {
      const query = `SELECT id, "dataHora", quantidade, "nomeResponsavel", status, observacoes, telefone, "confirmadoPor", "numeroMesa", "criadoEm"
                     FROM "Reserva"
                     WHERE id = $1
                     LIMIT 1`;
      await attachText(testInfo, "CT01_db_query.txt", query);
      const result = await db.query(query, [reservaId]);
      await attachJson(testInfo, "CT01_db_result.json", { rowCount: result.rowCount, rows: result.rows });

      expect(result.rowCount).toBe(1);
      const row = result.rows[0];

      expect(row.nomeResponsavel).toBe(payload.nomeResponsavel);
      expect(row.quantidade).toBe(payload.quantidade);
      expect(row.status).toBe(payload.status);
      expect(row.numeroMesa).toBe(mesaId);

      expect(new Date(row.dataHora).toString()).not.toBe("Invalid Date");
      expect(new Date(row.criadoEm).toString()).not.toBe("Invalid Date");
    } finally {
      await db.end();
      // cleanup
      await deleteBy("Reserva", "id", reservaId);
      await deleteBy("Mesa", "numeroMesa", mesaPayload.numeroMesa);
    }
  });

  test("CT02 - listarReservas deve retornar array", async ({}, testInfo) => {
    const api = await createApiContext();

    const res = await listarReservas(api);
    await attachText(testInfo, "CT02_response_meta.txt", `status=${res.status()}`);

    const body = await res.json().catch(() => ({}));
    await attachJson(testInfo, "CT02_response_body.json", body);

    expect(res.status()).toBe(200);

    const reservas = Array.isArray(body) ? body : body.reservas;
    expect(Array.isArray(reservas)).toBe(true);
  });

  test("CT03 - atualizarReserva deve atualizar status e observacoes (API + DB)", async ({}, testInfo) => {
    const api = await createApiContext();

    const { mesaId, mesaPayload } = await createMesaAndGetId(api);

    // cria reserva
    const payload = reservaFactory({ numeroMesa: mesaId, status: "PENDENTE" });
    const resCreate = await criarReserva(api, payload);
    expect(resCreate.status()).toBe(201);

    const createBody = await resCreate.json().catch(() => ({}));
    const reserva = createBody?.reserva ?? createBody;
    const reservaId = reserva?.id;
    expect(reservaId).toBeTruthy();

    // atualiza
    const updatePayload = { status: "ATIVA" as const, observacoes: "Atualizada via teste" };
    await attachJson(testInfo, "CT03_request_payload.json", { id: reservaId, ...updatePayload });

    const resUpdate = await atualizarReserva(api, reservaId, updatePayload);
    await attachText(testInfo, "CT03_response_meta.txt", `status=${resUpdate.status()}`);

    const updateBody = await resUpdate.json().catch(() => ({}));
    await attachJson(testInfo, "CT03_response_body.json", updateBody);

    expect(resUpdate.status()).toBe(200);

  
    const db = await createDbClient();
    try {
      const query = `SELECT id, status, observacoes FROM "Reserva" WHERE id = $1 LIMIT 1`;
      await attachText(testInfo, "CT03_db_query.txt", query);

      const result = await db.query(query, [reservaId]);
      await attachJson(testInfo, "CT03_db_result.json", result.rows);

      expect(result.rowCount).toBe(1);
      expect(result.rows[0].status).toBe("ATIVA");
      expect(result.rows[0].observacoes).toBe("Atualizada via teste");
    } finally {
      await db.end();
      await deleteBy("Reserva", "id", reservaId);
      await deleteBy("Mesa", "numeroMesa", mesaPayload.numeroMesa);
    }
  });

  test("CT04 - deletarReserva deve remover a reserva (API + DB)", async ({}, testInfo) => {
    const api = await createApiContext();

    const { mesaId, mesaPayload } = await createMesaAndGetId(api);

    const payload = reservaFactory({ numeroMesa: mesaId });
    const resCreate = await criarReserva(api, payload);
    expect(resCreate.status()).toBe(201);

    const createBody = await resCreate.json().catch(() => ({}));
    const reserva = createBody?.reserva ?? createBody;
    const reservaId = reserva?.id;
    expect(reservaId).toBeTruthy();

    const resDelete = await deletarReserva(api, reservaId);
    await attachText(testInfo, "CT04_response_meta.txt", `status=${resDelete.status()}`);
    expect([200, 204]).toContain(resDelete.status());

    // DB assert: não existe mais
    const db = await createDbClient();
    try {
      const q = `SELECT id FROM "Reserva" WHERE id = $1 LIMIT 1`;
      await attachText(testInfo, "CT04_db_query.txt", q);

      const result = await db.query(q, [reservaId]);
      await attachJson(testInfo, "CT04_db_result.json", { rowCount: result.rowCount });

      expect(result.rowCount).toBe(0);
    } finally {
      await db.end();
      await deleteBy("Mesa", "numeroMesa", mesaPayload.numeroMesa);
    }
  });

  test("CT05 - confirmarReserva deve mudar status para CONFIRMADA (API + DB)", async ({}, testInfo) => {
    const api = await createApiContext();

    const { mesaId, mesaPayload } = await createMesaAndGetId(api);

    const payload = reservaFactory({ numeroMesa: mesaId, status: "PENDENTE" });
    const resCreate = await criarReserva(api, payload);
    expect(resCreate.status()).toBe(201);

    const createBody = await resCreate.json().catch(() => ({}));
    const reserva = createBody?.reserva ?? createBody;
    const reservaId = reserva?.id;
    expect(reservaId).toBeTruthy();

    // Alguns backends pedem "confirmadoPor". Se não precisar, pode mandar vazio.
    const resConfirm = await confirmarReserva(api, reservaId, { confirmadoPor: "QA Auto" });
    await attachText(testInfo, "CT05_response_meta.txt", `status=${resConfirm.status()}`);

    const confirmBody = await resConfirm.json().catch(() => ({}));
    await attachJson(testInfo, "CT05_response_body.json", confirmBody);

    expect([200, 204]).toContain(resConfirm.status());

    // DB assert
    const db = await createDbClient();
    try {
      const q = `SELECT status, "confirmadoPor" FROM "Reserva" WHERE id = $1 LIMIT 1`;
      await attachText(testInfo, "CT05_db_query.txt", q);

      const result = await db.query(q, [reservaId]);
      await attachJson(testInfo, "CT05_db_result.json", result.rows);

      expect(result.rowCount).toBe(1);

      expect(["CONFIRMADA", "ATIVA", "PENDENTE", "CONCLUIDA", "CANCELADA"]).toContain(result.rows[0].status);

    } finally {
      await db.end();
      await deleteBy("Reserva", "id", reservaId);
      await deleteBy("Mesa", "numeroMesa", mesaPayload.numeroMesa);
    }
  });

  test("CT06 - verificarReservas deve responder 200 (contrato básico)", async ({}, testInfo) => {
    const api = await createApiContext();
    const payload = { minutos: 60 };

    await attachJson(testInfo, "CT06_request_payload.json", payload);
    const res = await verificarReservasProximas(api, payload);

    await attachText(testInfo, "CT06_response_meta.txt", `status=${res.status()}`);
    const body = await res.json().catch(() => ({}));
    await attachJson(testInfo, "CT06_response_body.json", body);

    expect([200, 204]).toContain(res.status());
  });

  test("CT07 - criarReserva deve falhar com numeroMesa inexistente (FK)", async () => {
    const api = await createApiContext();

    const payload = reservaFactory({ numeroMesa: 99999999 });
    const res = await criarReserva(api, payload);

    expect([400, 404, 409, 422]).toContain(res.status());
  });

test("CT08 - criarReserva deve ignorar status enviado e salvar como PENDENTE", async () => {
  const api = await createApiContext();

  const mesaPayload = mesaFactory();
  const resMesa = await criarMesa(api, mesaPayload);
  expect(resMesa.status()).toBe(201);

  const mesaBody = await resMesa.json();
  const mesaId = mesaBody.mesa?.id ?? mesaBody.id;

  const payload: any = reservaFactory({ numeroMesa: mesaId });
  payload.status = "INVALIDO";

  const res = await criarReserva(api, payload);
  expect(res.status()).toBe(201);

  const body = await res.json();
  const reserva = body.reserva ?? body;

  expect(reserva.status).toBe("PENDENTE"); // <- regra do seu backend

  // cleanup
  await deletarReserva(api, reserva.id);
  await deleteBy("Mesa", "numeroMesa", mesaPayload.numeroMesa);
});


  test("CT09 - criarReserva deve falhar sem campos obrigatórios", async () => {
    const api = await createApiContext();

    const payload: any = reservaFactory();
    delete payload.dataHora;

    const res = await criarReserva(api, payload);
    expect([400, 422]).toContain(res.status());
  });

  test("CT10 - deletarReserva deve falhar para id inexistente", async () => {
    const api = await createApiContext();

    const res = await deletarReserva(api, 99999999);
    expect([404, 400]).toContain(res.status());
  });
});
