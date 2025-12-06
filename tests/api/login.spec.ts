import { test, expect } from "@playwright/test";
import { createApiContext } from "../../src/api/client";
import { registerUser, loginUser } from "../../src/api/auth";
import { usuarioFactory } from "../../src/api/factories/usuario.factory";

test.describe("Auth - /auth/login", () => {
  test("CT01 - deve logar com sucesso e retornar token + usuario", async () => {
    const api = await createApiContext();

    const senha = "123456";
    const user = usuarioFactory({ senha });

    // garante usuário existente
    const resRegister = await registerUser(api, user);
    expect(resRegister.status()).toBe(201);

    // login
    const resLogin = await loginUser(api, { email: user.email, senha });
    expect(resLogin.status()).toBe(200);

    const body = await resLogin.json();

    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(10);

    expect(body).toHaveProperty("usuario");
    expect(body.usuario).toHaveProperty("email", user.email);
    expect(body.usuario).toHaveProperty("tipo", user.tipo);
    expect(body.usuario).toHaveProperty("id");
  });

  test("CT02 - deve retornar 401 para senha inválida", async () => {
    const api = await createApiContext();

    const user = usuarioFactory({ senha: "123456" });
    const resRegister = await registerUser(api, user);
    expect(resRegister.status()).toBe(201);

    const resLogin = await loginUser(api, { email: user.email, senha: "senha_errada" });
    expect(resLogin.status()).toBe(401);

    const body = await resLogin.json().catch(() => ({}));
    expect(body).toHaveProperty("error");
  });

  test("CT03 - deve retornar 401 para email inexistente", async () => {
    const api = await createApiContext();

    const resLogin = await loginUser(api, { email: "naoexiste@qa.com", senha: "123456" });
    expect(resLogin.status()).toBe(401);

    const body = await resLogin.json().catch(() => ({}));
    expect(body).toHaveProperty("error");
  });

  test("CT04 - deve retornar 401 quando faltar email ou senha", async () => {
    const api = await createApiContext();

    const res1 = await loginUser(api, { email: "", senha: "123456" });
    expect([400, 401, 422]).toContain(res1.status());

    const res2 = await loginUser(api, { email: "x@qa.com", senha: "" });
    expect([400, 401, 422]).toContain(res2.status());
  });
});
