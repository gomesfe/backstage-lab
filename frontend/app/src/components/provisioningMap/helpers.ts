import type {
  Ambiente,
  EstadoAmbiente,
  FiltrosColuna,
  FiltrosRecursos,
  FiltrosRepositorios,
  Recurso,
  Repositorio,
} from './types';

export const AMBIENTES: Ambiente[] = ['dev', 'perf', 'int', 'ext', 'prod', 'prdnv'];

/** Exclusão dentro desta janela sai direto; depois dela vira pedido de aprovação. */
export const FREE_DELETE_WINDOW_HOURS = 72;

/** Promoções para estes ambientes passam pelo time de cloud. */
export const AMBIENTES_COM_CLOUD: Ambiente[] = ['prod', 'prdnv'];

export const ITENS_POR_PAGINA = [10, 15, 25, 50];

export function precisaDoCloud(ambiente: Ambiente): boolean {
  return AMBIENTES_COM_CLOUD.includes(ambiente);
}

/** "04/09/26 12:00" → "04/09/26" (a tabela mostra só o dia). */
export function soData(data: string): string {
  return data.split(' ')[0];
}

/** Compara sem maiúsculas nem acentos. */
export function contem(texto: string, busca: string): boolean {
  const normaliza = (valor: string) =>
    valor.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return normaliza(texto).includes(normaliza(busca.trim()));
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
export function valorDaColunaRecurso(recurso: Recurso, coluna: string, servicos: Record<string, string>): string {
  if (coluna === 'nome') return recurso.nome;
  if (coluna === 'servico') return `${recurso.servico} ${servicos[recurso.servico] ?? ''}`;
  if (coluna === 'oferta') return recurso.oferta;
  return textoDoAmbiente(recurso.ambientes[coluna as Ambiente]);
}

export function valorDaColunaRepositorio(repositorio: Repositorio, coluna: string, servicos: Record<string, string>): string {
  if (coluna === 'nome') return repositorio.nome;
  if (coluna === 'servico') return `${repositorio.servico} ${servicos[repositorio.servico] ?? ''}`;
  return repositorio.oferta;
}

function passaColunas<T>(item: T, colunas: FiltrosColuna, valor: (item: T, coluna: string) => string): boolean {
  return Object.entries(colunas).every(([coluna, busca]) => !busca.trim() || contem(valor(item, coluna), busca));
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
      passaColunas(recurso, colunas, (item, coluna) => valorDaColunaRecurso(item, coluna, servicos)),
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
      passaColunas(repositorio, colunas, (item, coluna) => valorDaColunaRepositorio(item, coluna, servicos)),
  );
}

export function paginar<T>(itens: T[], pagina: number, porPagina: number): T[] {
  return itens.slice(pagina * porPagina, pagina * porPagina + porPagina);
}

/** Valores distintos, em ordem alfabética — opções dos filtros. */
export function distintos(valores: string[]): string[] {
  return Array.from(new Set(valores)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Quantos filtros da barra estão ativos (para o rótulo do botão Filtros). */
export function filtrosAtivos(filtros: FiltrosRecursos | FiltrosRepositorios): number {
  return [filtros.busca, filtros.oferta, filtros.servico].filter(Boolean).length;
}
