import { stringifyEntityRef, type Entity } from '@backstage/catalog-model';
import { contem, passaColunas, type FiltrosColuna } from '../shared/filtros';
import type { Coluna, Entidade, Filtros } from './types';

export const SEM_FILTROS: Filtros = {
  busca: '',
  soFavoritos: false,
  tipo: '',
  dono: '',
  ciclo: '',
  tag: '',
};

/** Como cada kind aparece na tela. */
export const ROTULO_TIPO: Record<string, string> = {
  Component: 'Aplicação',
  System: 'Sistema',
  Resource: 'Recurso',
  Group: 'Squad',
  API: 'API',
};

export const ROTULO_COLUNA: Record<Coluna, string> = {
  nome: 'Nome',
  descricao: 'Descrição',
  tipo: 'Tipo',
  subtipo: 'Subtipo',
  dono: 'Dono',
  ciclo: 'Ciclo de vida',
  tags: 'Tags',
};

/** Namespace dos itens internos do time do Atlas (aba "Interno do Atlas"). */
export const NAMESPACE_INTERNO = 'atlas';

/** "group:default/pagamentos" → "pagamentos". */
function nomeDoDono(dono: unknown): string {
  return String(dono ?? '')
    .replace(/^group:/, '')
    .replace(/^default\//, '');
}

export function paraEntidade(entity: Entity): Entidade {
  const spec = (entity.spec ?? {}) as {
    type?: string;
    owner?: string;
    lifecycle?: string;
  };
  return {
    ref: stringifyEntityRef(entity),
    tipo: entity.kind,
    nome: entity.metadata.name,
    namespace: entity.metadata.namespace ?? 'default',
    descricao: entity.metadata.description ?? '',
    subtipo: spec.type ?? '',
    dono: nomeDoDono(spec.owner),
    ciclo: spec.lifecycle ?? '',
    tags: entity.metadata.tags ?? [],
    temDocs: Boolean(
      entity.metadata.annotations?.['backstage.io/techdocs-ref'],
    ),
  };
}

/**
 * Para onde o nome leva: a tela da entidade (`/entidade#<kind>-<nome>`), ou a
 * aba de documentação dela quando `docs`.
 */
export function linkDaEntidade(entidade: Entidade, docs = false): string {
  return `/entidade#${entidade.tipo.toLowerCase()}-${entidade.nome.toLowerCase()}${
    docs ? '-docs' : ''
  }`;
}

export function valorDaColuna(entidade: Entidade, coluna: string): string {
  switch (coluna as Coluna) {
    case 'tipo':
      return ROTULO_TIPO[entidade.tipo] ?? entidade.tipo;
    case 'tags':
      return entidade.tags.join(' ');
    case 'nome':
    case 'descricao':
    case 'subtipo':
    case 'dono':
    case 'ciclo':
      return entidade[coluna as Exclude<Coluna, 'tipo' | 'tags'>];
    default:
      return '';
  }
}

export function filtrarEntidades(
  entidades: Entidade[],
  filtros: Filtros,
  colunas: FiltrosColuna,
  ehFavorita: (entidade: Entidade) => boolean,
): Entidade[] {
  return entidades.filter(
    entidade =>
      (!filtros.busca.trim() ||
        contem(
          `${entidade.nome} ${entidade.descricao} ${entidade.tags.join(' ')}`,
          filtros.busca,
        )) &&
      (!filtros.soFavoritos || ehFavorita(entidade)) &&
      (!filtros.tipo || entidade.tipo === filtros.tipo) &&
      (!filtros.dono || entidade.dono === filtros.dono) &&
      (!filtros.ciclo || entidade.ciclo === filtros.ciclo) &&
      (!filtros.tag || entidade.tags.includes(filtros.tag)) &&
      passaColunas(entidade, colunas, valorDaColuna),
  );
}

export function temFiltro(filtros: Filtros, colunas: FiltrosColuna): boolean {
  return (
    Object.values(filtros).some(Boolean) ||
    Object.values(colunas).some(valor => valor.trim())
  );
}

/** `?kind=`, `?owner=`, `?tag=`, `?q=`, `?fav=1` — os links da Home e de Meus grupos chegam filtrados. */
export function filtrosDoEndereco(search: string): Filtros {
  const parametros = new URLSearchParams(search);
  return {
    busca: parametros.get('q') ?? '',
    soFavoritos: parametros.get('fav') === '1',
    tipo: parametros.get('kind') ?? '',
    dono: parametros.get('owner') ?? '',
    ciclo: parametros.get('lifecycle') ?? '',
    tag: parametros.get('tag') ?? '',
  };
}
