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
  reservas: {
    criar: "/criarReserva",
    listar: "/listarReservas",
    deletar: (id: number | string) => `/deletarReserva/${id}`,
    atualizar: (id: number | string) => `/atualizarReserva/${id}`,
    verificarProximas: "/verificarReservas",
    confirmar: (id: number | string) => `/ConfirmarReserva/${id}`,
  },
} as const;
