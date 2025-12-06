import { test, expect } from "@playwright/test";
import { createApiContext } from "../../src/api/client";
import { registerUser } from "../../src/api/auth";
import { usuarioFactory } from "../../src/api/factories/usuario.factory";

test.describe("Usuário - /auth/registro", () => {
  test("CT01 - deve criar usuário com sucesso", async () => {
    const api = await createApiContext();
    const payload = usuarioFactory();

    const res = await registerUser(api, payload);
    expect(res.status()).toBe(201);

    const body = await res.json();

    expect(body).toHaveProperty("usuario.id");
    expect(body).toHaveProperty("usuario.nome", payload.nome);
    expect(body).toHaveProperty("usuario.email", payload.email);
    expect(body).toHaveProperty("usuario.tipo", payload.tipo);

   
    expect(body).toHaveProperty("usuario.senha");
    expect(body.usuario.senha).not.toBe(payload.senha);


    if (body.usuario.criadoEm) {
      expect(new Date(body.usuario.criadoEm).toString()).not.toBe("Invalid Date");
    }
  });

  test("CT02 - não deve permitir email duplicado", async () => {
    const api = await createApiContext();
    const payload = usuarioFactory();

    const res1 = await registerUser(api, payload);
    expect(res1.status()).toBe(201);

    const res2 = await registerUser(api, payload);
    expect([400, 409]).toContain(res2.status()); 
  });

  test("CT03 - deve falhar sem 'tipo' (obrigatório)", async () => {
    const api = await createApiContext();
    const payload: any = usuarioFactory();
    delete payload.tipo;

    const res = await registerUser(api, payload);
    expect([400, 422]).toContain(res.status());
  });

  test("CT04 - deve falhar com 'tipo' inválido", async () => {
    const api = await createApiContext();
    const payload: any = usuarioFactory();
    payload.tipo = "ADMIN"; // inválido

    const res = await registerUser(api, payload);
    expect([400, 422]).toContain(res.status());
  });

  test("CT05 - deve falhar com email inválido", async () => {
    const api = await createApiContext();
    const payload = usuarioFactory({ email: "email_invalido" });

    const res = await registerUser(api, payload);
    expect([400, 422]).toContain(res.status());
  });
});
