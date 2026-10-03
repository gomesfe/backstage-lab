/** Pedido de acesso emergencial a uma conta AWS. */
export type Pedido = {
  perfil: string;
  horas: number;
  /** ID da conta AWS: 12 dígitos. */
  conta: string;
  justificativa: string;
};
