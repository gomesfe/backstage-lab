/** Filtro por coluna: chave da coluna → texto digitado no funil. */
export type FiltrosColuna = Record<string, string>;

export const ITENS_POR_PAGINA = [10, 15, 25, 50];

/** Compara sem maiúsculas nem acentos. */
export function contem(texto: string, busca: string): boolean {
  const normaliza = (valor: string) =>
    valor.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return normaliza(texto).includes(normaliza(busca.trim()));
}

/** Passa em todos os funis preenchidos? `valor` diz o texto de cada coluna do item. */
export function passaColunas<T>(item: T, colunas: FiltrosColuna, valor: (item: T, coluna: string) => string): boolean {
  return Object.entries(colunas).every(([coluna, busca]) => !busca.trim() || contem(valor(item, coluna), busca));
}

export function paginar<T>(itens: T[], pagina: number, porPagina: number): T[] {
  return itens.slice(pagina * porPagina, pagina * porPagina + porPagina);
}

/** Valores distintos, em ordem alfabética — opções dos filtros. */
export function distintos(valores: string[]): string[] {
  return Array.from(new Set(valores)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
