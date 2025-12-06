export type StatusReserva =
  | "PENDENTE"
  | "CANCELADA"
  | "CONFIRMADA"
  | "ATIVA"
  | "CONCLUIDA";

export type NovaReservaPayload = {
  dataHora: string; 
  quantidade: number;
  nomeResponsavel: string;
  status: StatusReserva;
  observacoes?: string | null;
  telefone?: string | null;
  confirmadoPor?: string | null;
  numeroMesa: number; 
};

export type AtualizarReservaPayload = Partial<NovaReservaPayload>;

export function reservaFactory(
  overrides: Partial<NovaReservaPayload> = {}
): NovaReservaPayload {
  const rand = Math.random().toString(16).slice(2);

  const dt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  return {
    dataHora: dt,
    quantidade: 2,
    nomeResponsavel: `Responsável ${rand}`,
    status: "PENDENTE",
    observacoes: null,
    telefone: "11999999999",
    confirmadoPor: null,
    numeroMesa: 1, 
    ...overrides,
  };
}
