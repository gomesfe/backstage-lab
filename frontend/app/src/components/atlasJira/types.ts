export type TipoIssue = 'Bug' | 'Melhoria' | 'Tarefa' | 'Dúvida';

export type StatusCard = 'A fazer' | 'Em andamento' | 'Em revisão';

/** Issue do GitHub importada, esperando virar card (ou ser descartada). */
export type Rascunho = {
  id: string;
  /** Repositório e número da issue: `atlas-templates#412`. */
  origem: string;
  /** Quem executou o template/ação que gerou a issue. */
  solicitante: string;
  titulo: string;
  tipo: TipoIssue;
  /** "dd/mm/aa hh:mm". */
  importadoEm: string;
  descricao: string;
};

export type Card = {
  chave: string;
  titulo: string;
  tipo: TipoIssue;
  status: StatusCard;
  responsavel: string;
  origem: string;
  criadoEm: string;
};

export type Secao = 'rascunhos' | 'cards';

export type Dialogo =
  | { tipo: 'rascunho'; rascunho: Rascunho }
  | { tipo: 'criar'; rascunho: Rascunho }
  | { tipo: 'descartar'; rascunho: Rascunho }
  | { tipo: 'card'; card: Card };
