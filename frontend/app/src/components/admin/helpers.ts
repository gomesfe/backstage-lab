import type { Chave } from '../apiKeys/api';

const MES_MS = 30 * 24 * 60 * 60 * 1000;

/** Quem emitiu chaves, com quantas estão ativas e o último uso. */
export type UsuarioComChaves = {
  usuario: string;
  ativas: number;
  total: number;
  /** Epoch em ms; comparar datas formatadas como texto ordena errado. */
  ultimoUsoMs: number | null;
};

export function agruparPorDono(chaves: Chave[]): UsuarioComChaves[] {
  const porDono = new Map<string, UsuarioComChaves>();
  for (const chave of chaves) {
    const atual = porDono.get(chave.owner) ?? {
      usuario: chave.owner.replace(/^user:(default\/)?/, ''),
      ativas: 0,
      total: 0,
      ultimoUsoMs: null,
    };
    atual.total += 1;
    if (chave.status === 'active') atual.ativas += 1;
    if (chave.lastUsedAt) {
      const ms = new Date(chave.lastUsedAt).getTime();
      if (atual.ultimoUsoMs === null || ms > atual.ultimoUsoMs)
        atual.ultimoUsoMs = ms;
    }
    porDono.set(chave.owner, atual);
  }
  return [...porDono.values()].sort((a, b) => b.ativas - a.ativas);
}

/**
 * Ativa e sem uso há 30 dias (ou nunca usada e criada há mais de 30):
 * candidata a revogação — credencial esquecida é superfície de ataque.
 */
export function paradaHaUmMes(
  chave: Chave,
  agora: number = Date.now(),
): boolean {
  return (
    chave.status === 'active' &&
    agora - new Date(chave.lastUsedAt ?? chave.createdAt).getTime() > MES_MS
  );
}
