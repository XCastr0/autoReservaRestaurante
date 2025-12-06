import { test, expect } from "@playwright/test";
import { createApiContext } from "../../src/api/client";
import { registerUser } from "../../src/api/auth";
import { usuarioFactory } from "../../src/api/factories/usuario.factory";
import { createDbClient } from "../../src/db/client";
import { attachJson, attachText, maskPassword } from "../../src/support/attachments";

test.describe("Usuário - /auth/registro", () => {
  test("CT01 - deve criar usuário com sucesso (API + DB)", async ({}, testInfo) => {
    const api = await createApiContext();
    const payload = usuarioFactory();

    await attachJson(testInfo, "CT01_request_payload.json", maskPassword(payload));

    const res = await registerUser(api, payload);
    await attachText(testInfo, "CT01_response_meta.txt", `status=${res.status()}`);

    const body = await res.json().catch(() => ({}));
    await attachJson(testInfo, "CT01_response_body.json", body);

    expect(res.status()).toBe(201);

    expect(body).toHaveProperty("usuario.id");
    expect(body).toHaveProperty("usuario.nome", payload.nome);
    expect(body).toHaveProperty("usuario.email", payload.email);
    expect(body).toHaveProperty("usuario.tipo", payload.tipo);

    expect(body).toHaveProperty("usuario.senha");
    expect(body.usuario.senha).not.toBe(payload.senha);

    if (body.usuario.criadoEm) {
      expect(new Date(body.usuario.criadoEm).toString()).not.toBe("Invalid Date");
    }

    const db = await createDbClient();
    try {
      const sql =
        `SELECT id, nome, email, senha, tipo, "criadoEm"
         FROM "Usuario"
         WHERE email = $1
         LIMIT 1`;

      await attachText(testInfo, "CT01_db_query.txt", `SQL:\n${sql}\nPARAMS:\n${JSON.stringify([payload.email])}`);

      const result = await db.query(sql, [payload.email]);
      await attachJson(testInfo, "CT01_db_result.json", {
        rowCount: result.rowCount,
        rows: result.rows.map((r: any) => maskPassword(r)),
      });

      expect(result.rowCount).toBe(1);

      const row = result.rows[0];
      expect(row.nome).toBe(payload.nome);
      expect(row.email).toBe(payload.email);
      expect(row.tipo).toBe(payload.tipo);
      expect(row.senha).not.toBe(payload.senha);
      expect(new Date(row.criadoEm).toString()).not.toBe("Invalid Date");
    } finally {
      await db.query(`DELETE FROM "Usuario" WHERE email = $1`, [payload.email]);
      await db.end();
    }
  });

  test("CT02 - não deve permitir email duplicado", async ({}, testInfo) => {
    const api = await createApiContext();
    const payload = usuarioFactory();

    await attachJson(testInfo, "CT02_request_payload.json", maskPassword(payload));

    const res1 = await registerUser(api, payload);
    const body1 = await res1.json().catch(() => ({}));
    await attachText(testInfo, "CT02_first_response_meta.txt", `status=${res1.status()}`);
    await attachJson(testInfo, "CT02_first_response_body.json", body1);

    expect(res1.status()).toBe(201);

    const res2 = await registerUser(api, payload);
    const body2 = await res2.json().catch(() => ({}));
    await attachText(testInfo, "CT02_second_response_meta.txt", `status=${res2.status()}`);
    await attachJson(testInfo, "CT02_second_response_body.json", body2);

    expect([400, 409]).toContain(res2.status());

    const db = await createDbClient();
    try {
      await db.query(`DELETE FROM "Usuario" WHERE email = $1`, [payload.email]);
    } finally {
      await db.end();
    }
  });

  test("CT03 - deve falhar sem 'tipo' (obrigatório)", async ({}, testInfo) => {
    const api = await createApiContext();
    const payload: any = usuarioFactory();
    delete payload.tipo;

    await attachJson(testInfo, "CT03_request_payload.json", maskPassword(payload));

    const res = await registerUser(api, payload);
    const body = await res.json().catch(() => ({}));

    await attachText(testInfo, "CT03_response_meta.txt", `status=${res.status()}`);
    await attachJson(testInfo, "CT03_response_body.json", body);

    expect([400, 422]).toContain(res.status());
  });

  test("CT04 - deve falhar com 'tipo' inválido", async ({}, testInfo) => {
    const api = await createApiContext();
    const payload: any = usuarioFactory();
    payload.tipo = "ADMIN";

    await attachJson(testInfo, "CT04_request_payload.json", maskPassword(payload));

    const res = await registerUser(api, payload);
    const body = await res.json().catch(() => ({}));

    await attachText(testInfo, "CT04_response_meta.txt", `status=${res.status()}`);
    await attachJson(testInfo, "CT04_response_body.json", body);

    expect([400, 422]).toContain(res.status());
  });

  test("CT05 - deve falhar com email inválido", async ({}, testInfo) => {
    const api = await createApiContext();
    const payload = usuarioFactory({ email: "email_invalido" });

    await attachJson(testInfo, "CT05_request_payload.json", maskPassword(payload));

    const res = await registerUser(api, payload);
    const body = await res.json().catch(() => ({}));

    await attachText(testInfo, "CT05_response_meta.txt", `status=${res.status()}`);
    await attachJson(testInfo, "CT05_response_body.json", body);

    expect([400, 422]).toContain(res.status());
  });
});
