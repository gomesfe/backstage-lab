import type { BadgeVariant } from '../../components';

/** Os ambientes do Atlas, na ordem de promoção. */
export const ENVIRONMENTS = ['dev', 'perf', 'int', 'ext', 'prod', 'prdnv'] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

/** Produção pede atenção; o resto é informação. */
export const ENV_VARIANT: Record<Environment, BadgeVariant> = {
  dev: 'info',
  perf: 'info',
  int: 'info',
  ext: 'purple',
  prod: 'warning',
  prdnv: 'warning',
};

/** Data e hora curtas em pt-BR: "26/09/26 14:05". */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { dateStyle: 'short' });
}

/** Data de exemplo relativa a agora — os exemplos não envelhecem. */
export function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}
