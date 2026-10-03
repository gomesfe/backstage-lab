import type { Pedido } from './types';

export const PERFIS = ['ReadOnlyAccess', 'PowerUserAccess', 'DatabaseAdmin', 'NetworkAdmin'];

export const DURACOES: { horas: number; rotulo: string }[] = [
  { horas: 1, rotulo: '1 hora' },
  { horas: 2, rotulo: '2 horas' },
  { horas: 4, rotulo: '4 horas' },
  { horas: 8, rotulo: '8 horas (máximo)' },
];

/** A justificativa vai para a auditoria: precisa dizer o incidente e o que fazer. */
export const JUSTIFICATIVA_MINIMA = 20;

export const PEDIDO_VAZIO: Pedido = { perfil: PERFIS[0], horas: 1, conta: '', justificativa: '' };

export type Erros = { conta?: string; justificativa?: string };

/** O que falta para o pedido valer. Vazio = pode enviar. */
export function validar(pedido: Pedido): Erros {
  const erros: Erros = {};
  if (!/^\d{12}$/.test(pedido.conta)) {
    erros.conta = /\D/.test(pedido.conta)
      ? 'Só números.'
      : `O ID da conta tem 12 dígitos (${pedido.conta.length}/12).`;
  }
  const tamanho = pedido.justificativa.trim().length;
  if (tamanho < JUSTIFICATIVA_MINIMA) {
    erros.justificativa = `Mínimo de ${JUSTIFICATIVA_MINIMA} caracteres (${tamanho}/${JUSTIFICATIVA_MINIMA}).`;
  }
  return erros;
}

export function rotuloDuracao(horas: number): string {
  return horas === 1 ? '1 hora' : `${horas} horas`;
}
