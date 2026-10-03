import type {
  Ambiente,
  EstadoAmbiente,
  FiltrosRecursos,
  FiltrosRepositorios,
  Recurso,
  Repositorio,
} from './types';
import { contem, passaColunas, type FiltrosColuna } from '../shared/filtros';

export {
  AMBIENTES,
  AMBIENTES_COM_CLOUD,
  precisaDoCloud,
} from '../shared/ambientes';
export {
  contem,
  distintos,
  ITENS_POR_PAGINA,
  paginar,
} from '../shared/filtros';

/** Exclusão dentro desta janela sai direto; depois dela vira pedido de aprovação. */
export const FREE_DELETE_WINDOW_HOURS = 72;

/** "04/09/26 12:00" → "04/09/26" (a tabela mostra só o dia). */
export function soData(data: string): string {
  return data.split(' ')[0];
}

/** Texto que a célula de um ambiente mostra — é nele que o filtro da coluna procura. */
export function textoDoAmbiente(estado: EstadoAmbiente): string {
  switch (estado.tipo) {
    case 'vazio':
      return 'promover';
    case 'exclusaoPendente':
      return `${estado.data} exclusão pendente`;
    case 'aguardandoCloud':
      return `${estado.data} aguardando cloud`;
    default:
      return `${estado.data} excluir`;
  }
}

/** Valor de cada coluna da tabela de recursos, para o filtro por coluna. */
export function valorDaColunaRecurso(
  recurso: Recurso,
  coluna: string,
  servicos: Record<string, string>,
): string {
  if (coluna === 'nome') return recurso.nome;
  if (coluna === 'servico')
    return `${recurso.servico} ${servicos[recurso.servico] ?? ''}`;
  if (coluna === 'oferta') return recurso.oferta;
  return textoDoAmbiente(recurso.ambientes[coluna as Ambiente]);
}

export function valorDaColunaRepositorio(
  repositorio: Repositorio,
  coluna: string,
  servicos: Record<string, string>,
): string {
  if (coluna === 'nome') return repositorio.nome;
  if (coluna === 'servico')
    return `${repositorio.servico} ${servicos[repositorio.servico] ?? ''}`;
  return repositorio.oferta;
}

export function filtrarRecursos(
  recursos: Recurso[],
  filtros: FiltrosRecursos,
  colunas: FiltrosColuna,
  servicos: Record<string, string>,
): Recurso[] {
  return recursos.filter(
    recurso =>
      (!filtros.busca || contem(recurso.nome, filtros.busca)) &&
      (!filtros.oferta || recurso.oferta === filtros.oferta) &&
      (!filtros.servico || recurso.servico === filtros.servico) &&
      passaColunas(recurso, colunas, (item, coluna) =>
        valorDaColunaRecurso(item, coluna, servicos),
      ),
  );
}

export function filtrarRepositorios(
  repositorios: Repositorio[],
  filtros: FiltrosRepositorios,
  colunas: FiltrosColuna,
  servicos: Record<string, string>,
): Repositorio[] {
  return repositorios.filter(
    repositorio =>
      (!filtros.busca || contem(repositorio.nome, filtros.busca)) &&
      (!filtros.oferta || repositorio.oferta === filtros.oferta) &&
      (!filtros.servico || repositorio.servico === filtros.servico) &&
      passaColunas(repositorio, colunas, (item, coluna) =>
        valorDaColunaRepositorio(item, coluna, servicos),
      ),
  );
}

/** Quantos filtros da barra estão ativos (para o rótulo do botão Filtros). */
export function filtrosAtivos(
  filtros: FiltrosRecursos | FiltrosRepositorios,
): number {
  return [filtros.busca, filtros.oferta, filtros.servico].filter(Boolean)
    .length;
}
