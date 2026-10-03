import type { Chave, StatusChave } from './api';

const DIA = 24 * 60 * 60;
const SEMANA_MS = 7 * DIA * 1000;

export const ROTULO_STATUS: Record<StatusChave, string> = {
  active: 'ativa',
  revoked: 'revogada',
  expired: 'expirada',
};

/** Opções de "Expira em". O padrão é 30 dias. */
export const PRAZOS: { rotulo: string; segundos: number | null }[] = [
  { rotulo: '7 dias', segundos: 7 * DIA },
  { rotulo: '30 dias', segundos: 30 * DIA },
  { rotulo: '90 dias', segundos: 90 * DIA },
  { rotulo: '1 ano', segundos: 365 * DIA },
  { rotulo: 'Sem expiração', segundos: null },
];

export const PRAZO_PADRAO = 1;

export function formatarData(valor: string | null): string {
  return valor
    ? new Date(valor).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : '—';
}

/** Ativa e vence em menos de 7 dias: hora de emitir a substituta. */
export function expiraEmBreve(
  chave: Chave,
  agora: number = Date.now(),
): boolean {
  return (
    chave.status === 'active' &&
    chave.expiresAt !== null &&
    new Date(chave.expiresAt).getTime() - agora < SEMANA_MS
  );
}

export function contar(chaves: Chave[]) {
  return {
    ativas: chaves.filter(chave => chave.status === 'active').length,
    emBreve: chaves.filter(chave => expiraEmBreve(chave)).length,
    inativas: chaves.filter(chave => chave.status !== 'active').length,
  };
}
