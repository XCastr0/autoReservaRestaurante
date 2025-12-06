import { test, expect } from "@playwright/test";
import { createApiContext } from "../../src/api/client";
import { createDbClient } from "../../src/db/client";
import { attachJson, attachText } from "../../src/support/attachments";
import { cleanupMesaByNumero} from "../../src/support/db";
import { mesaFactory } from "../../src/api/factories/mesa.factory";
import { criarMesa, listarMesas, atualizarMesa } from "../../src/api/mesas";



test.describe("Mesa", () => {
  test("CT01 - deve criar mesa com sucesso (API + DB)", async ({}, testInfo) => {
    const api = await createApiContext();
    const payload = mesaFactory();
    await attachJson(testInfo, "CT01_request_payload.json", payload);
    const res = await criarMesa(api, payload);
    await attachText(testInfo, "CT01_response_meta.txt", `status=${res.status()}`);
    const body = await res.json().catch(() => ({}));
    await attachJson(testInfo, "CT01_response_body.json", body);
    expect(res.status()).toBe(201);

    const mesa = body?.mesa ?? body;

    expect(mesa).toHaveProperty("id");
    expect(mesa).toHaveProperty("numeroMesa", payload.numeroMesa);
    expect(mesa).toHaveProperty("capacidade", payload.capacidade);
    expect(mesa).toHaveProperty("status", payload.status);

    // ===== DB  =====
    const db = await createDbClient();
    try {
      const query = `SELECT id, "numeroMesa", capacidade, cliente, status, "horaOcupacao"
                     FROM "Mesa"
                     WHERE "numeroMesa" = $1
                     LIMIT 1`;
      await attachText(testInfo, "CT01_db_query.txt", query);

      const result = await db.query(query, [payload.numeroMesa]);
      await attachJson(testInfo, "CT01_db_result.json", { rowCount: result.rowCount, rows: result.rows });

      expect(result.rowCount).toBe(1);
      const row = result.rows[0];

      expect(row.numeroMesa).toBe(payload.numeroMesa);
      expect(row.capacidade).toBe(payload.capacidade);
      expect(row.status).toBe(payload.status);
    } finally {
      await db.end();
      await cleanupMesaByNumero(payload.numeroMesa);
    }
  });

  test("CT02 - não deve permitir numeroMesa duplicado", async ({}, testInfo) => {
    const api = await createApiContext();
    const payload = mesaFactory();
    const res1 = await criarMesa(api, payload);
    expect(res1.status()).toBe(201);
    await attachJson(testInfo, "CT02_request_payload.json", payload);
    const res2 = await criarMesa(api, payload);
    await attachText(testInfo, "CT02_response_meta.txt", `status=${res2.status()}`);
    const body2 = await res2.json().catch(() => ({}));
    await attachJson(testInfo, "CT02_response_body.json", body2);
    expect([400, 409]).toContain(res2.status());
    await cleanupMesaByNumero(payload.numeroMesa);
  });

  test("CT03 - listarMesas deve retornar array", async ({}, testInfo) => {
    const api = await createApiContext();

    const res = await listarMesas(api);
    await attachText(testInfo, "CT03_response_meta.txt", `status=${res.status()}`);
    const body = await res.json().catch(() => ({}));
    await attachJson(testInfo, "CT03_response_body.json", body);
    expect(res.status()).toBe(200);
    const mesas = Array.isArray(body) ? body : body.mesas;
    expect(Array.isArray(mesas)).toBe(true);
  });

  test("CT04 - atualizarMesa deve atualizar status/capacidade (API + DB)", async ({}, testInfo) => {
    const api = await createApiContext();

    // cria uma mesa antes
    const createdPayload = mesaFactory({ status: "disponivel", capacidade: 4 });
    const resCreate = await criarMesa(api, createdPayload);
    expect(resCreate.status()).toBe(201);

    const createdBody = await resCreate.json().catch(() => ({}));
    const mesa = createdBody?.mesa ?? createdBody;
    const mesaId = mesa?.id;

    expect(mesaId).toBeTruthy();

    const updatePayload = { status: "ocupada" as const, cliente: "Cliente Teste" };
    await attachJson(testInfo, "CT04_request_payload.json", { id: mesaId, ...updatePayload });

    const resUpdate = await atualizarMesa(api, mesaId, updatePayload);
    await attachText(testInfo, "CT04_response_meta.txt", `status=${resUpdate.status()}`);

    const updateBody = await resUpdate.json().catch(() => ({}));
    await attachJson(testInfo, "CT04_response_body.json", updateBody);

    expect(resUpdate.status()).toBe(200);

    const updatedMesa = updateBody?.mesa ?? updateBody;
    expect(updatedMesa).toHaveProperty("id");
    expect(updatedMesa).toHaveProperty("status", "ocupada");

    // ===== DB assert =====
    const db = await createDbClient();
    try {
      const query = `SELECT id, "numeroMesa", capacidade, cliente, status
                     FROM "Mesa"
                     WHERE id = $1
                     LIMIT 1`;
      await attachText(testInfo, "CT04_db_query.txt", query);

      const result = await db.query(query, [mesaId]);
      await attachJson(testInfo, "CT04_db_result.json", { rowCount: result.rowCount, rows: result.rows });

      expect(result.rowCount).toBe(1);
      const row = result.rows[0];

      expect(row.status).toBe("ocupada");
      expect(row.cliente).toBe("Cliente Teste");
    } finally {
      await db.end();
      await cleanupMesaByNumero(createdPayload.numeroMesa);
    }
  });

  test("CT05 - atualizarMesa deve falhar para id inexistente", async () => {
    const api = await createApiContext();

    const res = await atualizarMesa(api, 99999999, { status: "disponivel" });
    expect([404, 400]).toContain(res.status());
  });

  test("CT06 - criarMesa deve falhar com status inválido", async () => {
    const api = await createApiContext();

    const payload: any = mesaFactory();
    payload.status = "status_invalido";

    const res = await criarMesa(api, payload);
    expect([400, 422]).toContain(res.status());
  });

  test("CT07 - criarMesa deve falhar sem campos obrigatórios", async () => {
    const api = await createApiContext();

    const payload: any = mesaFactory();
    delete payload.numeroMesa;

    const res = await criarMesa(api, payload);
    expect([400, 422]).toContain(res.status());
  });
});
