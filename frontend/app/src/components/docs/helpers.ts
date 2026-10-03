import { contem, passaColunas, type FiltrosColuna } from '../shared/filtros';
import type { Documento, Filtros, TipoEntidade } from './types';

export const SEM_FILTROS: Filtros = { busca: '', soFavoritos: false, tipo: '', dono: '', cicloDeVida: '' };

/** Como o tipo aparece na tela. */
export const ROTULO_TIPO: Record<TipoEntidade, string> = { Component: 'Aplicação', System: 'Sistema', API: 'API' };

export function linkDoDocumento(documento: Documento): string {
  return `/entidade#${documento.ancora}`;
}

export function valorDaColuna(documento: Documento, coluna: string): string {
  switch (coluna) {
    case 'nome':
      return documento.nome;
    case 'descricao':
      return documento.descricao;
    case 'tipo':
      return ROTULO_TIPO[documento.tipo];
    case 'subtipo':
      return documento.subtipo;
    case 'dono':
      return documento.dono;
    case 'cicloDeVida':
      return documento.cicloDeVida;
    case 'tags':
      return documento.tags.join(' ');
    default:
      return '';
  }
}

export function filtrarDocumentos(documentos: Documento[], filtros: Filtros, colunas: FiltrosColuna, favoritos: Set<string>): Documento[] {
  return documentos.filter(
    documento =>
      (!filtros.busca.trim() || contem(`${documento.nome} ${documento.descricao} ${documento.tags.join(' ')}`, filtros.busca)) &&
      (!filtros.soFavoritos || favoritos.has(documento.ancora)) &&
      (!filtros.tipo || ROTULO_TIPO[documento.tipo] === filtros.tipo) &&
      (!filtros.dono || documento.dono === filtros.dono) &&
      (!filtros.cicloDeVida || documento.cicloDeVida === filtros.cicloDeVida) &&
      passaColunas(documento, colunas, valorDaColuna),
  );
}

export function temFiltro(filtros: Filtros, colunas: FiltrosColuna): boolean {
  return (
    Boolean(filtros.busca || filtros.soFavoritos || filtros.tipo || filtros.dono || filtros.cicloDeVida) ||
    Object.values(colunas).some(valor => valor.trim())
  );
}
