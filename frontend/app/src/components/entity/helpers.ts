import type { Entity } from '@backstage/catalog-model';
import { ROTULO_TIPO } from '../catalog/helpers';

/** Kinds pelo nome que aparece no endereço (`#component-…`, `#api-…`). */
const KIND_DO_ENDERECO: Record<string, string> = {
  component: 'Component',
  api: 'API',
  system: 'System',
  resource: 'Resource',
  group: 'Group',
};

/**
 * `#component-payments-api` → { kind: Component, nome: payments-api }.
 * O sufixo `-docs` (`#component-payments-api-docs`) leva à documentação.
 */
export function lerAncora(hash: string): {
  kind: string;
  nome: string;
  docs: boolean;
} {
  const ancora = decodeURIComponent(hash.replace(/^#/, '')).toLowerCase();
  const separador = ancora.indexOf('-');
  if (separador < 0) return { kind: '', nome: '', docs: false };
  const kind = KIND_DO_ENDERECO[ancora.slice(0, separador)] ?? '';
  const resto = ancora.slice(separador + 1);
  const docs = resto.endsWith('-docs');
  return { kind, nome: docs ? resto.slice(0, -'-docs'.length) : resto, docs };
}

/** Link da tela de entidade para outra entidade. */
export function linkPara(entidade: Entity): string {
  return `/entidade#${entidade.kind.toLowerCase()}-${entidade.metadata.name.toLowerCase()}`;
}

export function rotuloDoTipo(entidade: Entity): string {
  const tipo = ROTULO_TIPO[entidade.kind] ?? entidade.kind;
  const subtipo = (entidade.spec as { type?: string })?.type;
  return subtipo ? `${tipo} · ${subtipo}` : tipo;
}

/** "group:default/pagamentos" → "pagamentos". */
export function nomeCurto(ref: string | undefined): string {
  return String(ref ?? '')
    .replace(/^[a-z]+:/i, '')
    .replace(/^default\//, '');
}

/** De onde se chega: Catálogo ou APIs. */
export function origem(entidade: Entity): { rotulo: string; para: string } {
  return entidade.kind === 'API'
    ? { rotulo: 'APIs', para: '/api-docs' }
    : { rotulo: 'Catálogo', para: '/catalog' };
}
