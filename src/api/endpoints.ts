export const endpoints = {
  auth: {
    registro: "/auth/registro",
    login: "/auth/login",
  },
  mesas: {
    criar: "/criarMesa",
    listar: "/listarMesas",
    atualizar: (id: number | string) => `/atualizarMesa/${id}`,
  },
} as const;
