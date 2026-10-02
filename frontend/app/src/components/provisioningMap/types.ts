export type Ambiente = 'dev' | 'perf' | 'int' | 'ext' | 'prod' | 'prdnv';

export type Pessoa = { nome: string; email: string; id: string };

/** O que um recurso tem em um ambiente. `data` vem como "dd/mm/aa hh:mm". */
export type EstadoAmbiente =
  | { tipo: 'vazio' }
  | { tipo: 'provisionado'; data: string; versao: string; promovidoPor: Pessoa; exclusaoLivre: boolean }
  | { tipo: 'exclusaoPendente' | 'aguardandoCloud'; data: string; versao: string; promovidoPor: Pessoa };

export type EstadoProvisionado = Exclude<EstadoAmbiente, { tipo: 'vazio' }>;

export type Recurso = {
  nome: string;
  /** Sigla do serviço Núclea (ex.: PAG). */
  servico: string;
  oferta: string;
  gerenciadoPor: string;
  repositorio: string;
  ambientes: Record<Ambiente, EstadoAmbiente>;
};

export type Repositorio = {
  nome: string;
  servico: string;
  oferta: string;
  versao: string;
  visibilidade: string;
  recursos: number;
  criadoEm: string;
  criadoPor: Pessoa;
};

export type ItemInterno = { nome: string; tipo: string; oferta: string; ambientes: string[] };

export type Aba = 'recursos' | 'repositorios' | 'interno';

/** Filtros da barra (o "Todos" é `''`). */
export type FiltrosRecursos = { busca: string; oferta: string; servico: string };
export type FiltrosRepositorios = { busca: string; oferta: string; servico: string };

/** Filtro por coluna: chave da coluna → texto procurado. */
export type FiltrosColuna = Record<string, string>;

/** Diálogo aberto no momento (um por vez). */
export type Dialogo =
  | { tipo: 'promocao'; recurso: Recurso; ambiente: Ambiente }
  | { tipo: 'excluir'; recurso: Recurso; ambiente: Ambiente }
  | { tipo: 'promover'; recurso: Recurso; ambiente: Ambiente }
  | { tipo: 'recurso'; recurso: Recurso }
  | { tipo: 'repositorio'; repositorio: Repositorio }
  | { tipo: 'excluirRepositorio'; repositorio: Repositorio };
