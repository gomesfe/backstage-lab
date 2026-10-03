import type { Entity } from '@backstage/catalog-model';
import { contem } from '../shared/filtros';

/** Anotação de categoria das ofertas; sem ela, a oferta cai em "Outros". */
export const ANOTACAO_CATEGORIA = 'atlas.nuclea.com.br/categoria';
export const SEM_CATEGORIA = 'Outros';

export type Oferta = {
  nome: string;
  namespace: string;
  titulo: string;
  descricao: string;
  /** spec.type do template: resource, service, website… */
  tipo: string;
  tags: string[];
  categoria: string;
};

export function paraOferta(template: Entity): Oferta {
  return {
    nome: template.metadata.name,
    namespace: template.metadata.namespace ?? 'default',
    titulo: template.metadata.title ?? template.metadata.name,
    descricao: template.metadata.description ?? '',
    tipo: (template.spec as { type?: string })?.type ?? 'oferta',
    tags: template.metadata.tags ?? [],
    categoria:
      template.metadata.annotations?.[ANOTACAO_CATEGORIA] ?? SEM_CATEGORIA,
  };
}

/** O formulário da oferta, no scaffolder. */
export function linkDaOferta(oferta: Oferta): string {
  return `/create/templates/${oferta.namespace}/${oferta.nome}`;
}

/** Categoria → quantidade, em ordem alfabética (para o seletor com contagem). */
export function contarCategorias(ofertas: Oferta[]): [string, number][] {
  const contagem = new Map<string, number>();
  for (const oferta of ofertas)
    contagem.set(oferta.categoria, (contagem.get(oferta.categoria) ?? 0) + 1);
  return [...contagem.entries()].sort(([a], [b]) =>
    a.localeCompare(b, 'pt-BR'),
  );
}

/** Filtra por busca e categoria e agrupa por categoria. */
export function agruparOfertas(
  ofertas: Oferta[],
  busca: string,
  categoria: string,
): [string, Oferta[]][] {
  const grupos = new Map<string, Oferta[]>();
  for (const oferta of ofertas) {
    if (categoria && oferta.categoria !== categoria) continue;
    if (
      busca.trim() &&
      !contem(
        `${oferta.titulo} ${oferta.descricao} ${oferta.tags.join(' ')}`,
        busca,
      )
    )
      continue;
    grupos.set(oferta.categoria, [
      ...(grupos.get(oferta.categoria) ?? []),
      oferta,
    ]);
  }
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));
}
