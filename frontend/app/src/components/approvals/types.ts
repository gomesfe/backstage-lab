import type { Ambiente } from '../shared/ambientes';

/** De que lado do pedido você está: quem aprova ou quem pediu. */
export type Lado = 'aprovacao' | 'solicitacao';

export type Status = 'aguardando' | 'execucao' | 'concluido' | 'rejeitado' | 'cancelado' | 'falhou';

/** Abas de status da tabela. "Histórico" junta tudo o que já terminou. */
export type FiltroStatus = 'pendentes' | 'execucao' | 'historico' | 'todos';

export type SituacaoAprovador = 'aprovou' | 'pendente' | 'rejeitou' | 'sem resposta';

export type Aprovador = {
  /** Grupo aprovador (admin, DevOps…). */
  nome: string;
  nota: string;
  situacao: SituacaoAprovador;
};

export type EstadoEtapa = 'feito' | 'agora' | 'falhou' | 'cancelado' | 'pendente';

export type Etapa = {
  titulo: string;
  nota?: string;
  estado: EstadoEtapa;
};

export type Solicitacao = {
  id: string;
  lado: Lado;
  recurso: string;
  /** O recurso aparece no Mapa de provisionamento (link "Ver no mapa"). */
  noMapa: boolean;
  oferta: string;
  ambiente: Ambiente;
  grupo: string;
  dono: string;
  solicitante: string;
  time: string;
  /** "dd/mm/aa hh:mm". */
  data: string;
  aprovacoes: { feitas: number; total: number; por: string[] };
  status: Status;
  excluido: boolean;
  justificativa: string;
  aprovadores: Aprovador[];
  andamento: Etapa[];
};

export type Filtros = {
  busca: string;
  status: FiltroStatus;
  ambiente: string;
  grupo: string;
};

export type Dialogo =
  | { tipo: 'aprovar'; solicitacao: Solicitacao }
  | { tipo: 'rejeitar'; solicitacao: Solicitacao }
  | { tipo: 'cancelar'; solicitacao: Solicitacao }
  | { tipo: 'detalhes'; solicitacao: Solicitacao };
