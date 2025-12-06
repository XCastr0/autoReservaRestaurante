export type TipoUsuario = "GERENTE" | "GARCOM" | "ATENDENTE";

export type NovoUsuarioPayload = {
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
};

export function usuarioFactory(overrides: Partial<NovoUsuarioPayload> = {}): NovoUsuarioPayload {
  const rand = Math.random().toString(16).slice(2);
  return {
    nome: "Usuario Teste",
    email: `user_${rand}@qa.com`,
    senha: "123456",
    tipo: "GERENTE",
    ...overrides,
  };
}
