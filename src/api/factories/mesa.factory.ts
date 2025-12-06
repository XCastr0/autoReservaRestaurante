export type StatusMesa =
  | "disponivel"
  | "ocupada"
  | "reservada"
  | "confirmacao_pendente"
  | "indisponivel";

export type NovaMesaPayload = {
  numeroMesa: number;
  capacidade: number;
  cliente?: string | null;
  status: StatusMesa;
  horaOcupacao?: string | null;
};

export type AtualizarMesaPayload = Partial<NovaMesaPayload>;

export function mesaFactory(
  overrides: Partial<NovaMesaPayload> = {}
): NovaMesaPayload {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return {
    numeroMesa: rand,
    capacidade: 4,
    cliente: null,
    status: "disponivel",
    horaOcupacao: null,
    ...overrides,
  };
}
