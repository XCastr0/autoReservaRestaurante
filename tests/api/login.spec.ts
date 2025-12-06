import { test, expect } from "@playwright/test";
import { createApiContext } from "../../src/api/client";
import { registerUser, loginUser } from "../../src/api/auth";
import { usuarioFactory } from "../../src/api/factories/usuario.factory";
import { createDbClient } from "../../src/db/client";
import { attachJson, attachText, maskPassword } from "../../src/support/attachments";

async function cleanupUserByEmail(email: string) {
  const db = await createDbClient();
  try {
    await db.query(`DELETE FROM "Usuario" WHERE email = $1`, [email]);
  } finally {
    await db.end();
  }
}

test.describe("Auth - /auth/login", () => {
  test("CT01 - deve logar com sucesso e retornar token + usuario", async ({}, testInfo) => {
    const api = await createApiContext();

    const senha = "123456";
    const user = usuarioFactory({ senha });

    await attachJson(testInfo, "CT01_register_payload.json", maskPassword(user));

    // garante usuário existente
    const resRegister = await registerUser(api, user);
    await attachText(testInfo, "CT01_register_meta.txt", `status=${resRegister.status()}`);
    await attachJson(testInfo, "CT01_register_body.json", await resRegister.json().catch(() => ({})));
    expect(resRegister.status()).toBe(201);

    // login
    const loginPayload = { email: user.email, senha };
    await attachJson(testInfo, "CT01_login_payload.json", maskPassword({ ...loginPayload, senha: "****" } as any));

    const resLogin = await loginUser(api, loginPayload);
    await attachText(testInfo, "CT01_login_meta.txt", `status=${resLogin.status()}`);

    const body = await resLogin.json().catch(() => ({}));
    await attachJson(testInfo, "CT01_login_body.json", body);

    expect(resLogin.status()).toBe(200);

    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(10);

    expect(body).toHaveProperty("usuario");
    expect(body.usuario).toHaveProperty("email", user.email);
    expect(body.usuario).toHaveProperty("tipo", user.tipo);
    expect(body.usuario).toHaveProperty("id");

    await cleanupUserByEmail(user.email);
  });

  test("CT02 - deve retornar 401 para senha inválida", async ({}, testInfo) => {
    const api = await createApiContext();

    const user = usuarioFactory({ senha: "123456" });

    const resRegister = await registerUser(api, user);
    await attachText(testInfo, "CT02_register_meta.txt", `status=${resRegister.status()}`);
    expect(resRegister.status()).toBe(201);

    const loginPayload = { email: user.email, senha: "senha_errada" };
    await attachJson(testInfo, "CT02_login_payload.json", { ...loginPayload, senha: "****" });

    const resLogin = await loginUser(api, loginPayload);
    await attachText(testInfo, "CT02_login_meta.txt", `status=${resLogin.status()}`);

    const body = await resLogin.json().catch(() => ({}));
    await attachJson(testInfo, "CT02_login_body.json", body);

    expect(resLogin.status()).toBe(401);
    expect(body).toHaveProperty("error");

    await cleanupUserByEmail(user.email);
  });

  test("CT03 - deve retornar 401 para email inexistente", async ({}, testInfo) => {
    const api = await createApiContext();

    const loginPayload = { email: "naoexiste@qa.com", senha: "123456" };
    await attachJson(testInfo, "CT03_login_payload.json", { ...loginPayload, senha: "****" });

    const resLogin = await loginUser(api, loginPayload);
    await attachText(testInfo, "CT03_login_meta.txt", `status=${resLogin.status()}`);

    const body = await resLogin.json().catch(() => ({}));
    await attachJson(testInfo, "CT03_login_body.json", body);

    expect(resLogin.status()).toBe(401);
    expect(body).toHaveProperty("error");
  });

  test("CT04 - deve retornar erro quando faltar email ou senha", async ({}, testInfo) => {
    const api = await createApiContext();

    const p1 = { email: "", senha: "123456" };
    await attachJson(testInfo, "CT04_case1_payload.json", { ...p1, senha: "****" });
    const res1 = await loginUser(api, p1);
    await attachText(testInfo, "CT04_case1_meta.txt", `status=${res1.status()}`);
    expect([400, 401, 422]).toContain(res1.status());

    const p2 = { email: "x@qa.com", senha: "" };
    await attachJson(testInfo, "CT04_case2_payload.json", { ...p2, senha: "****" });
    const res2 = await loginUser(api, p2);
    await attachText(testInfo, "CT04_case2_meta.txt", `status=${res2.status()}`);
    expect([400, 401, 422]).toContain(res2.status());
  });
});
