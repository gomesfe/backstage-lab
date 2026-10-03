export type SituacaoServico = 'operacional' | 'degradado' | 'fora do ar';

export type Servico = {
  nome: string;
  /** Plugin ou peça do backend: catalog, scaffolder… */
  chave: string;
  descricao: string;
  /** Disponibilidade nos últimos 30 dias, já formatada ("99,98%"). */
  disponibilidade: string;
  situacao: SituacaoServico;
};

export type Incidente = {
  titulo: string;
  descricao: string;
  /** "25/09 · 10:20" ou "18/09 · 14:05 — 14:48". */
  quando: string;
  emAndamento: boolean;
};

export type StatusPlataforma = {
  time: string;
  /** Aviso no topo enquanto houver incidente em andamento. */
  aviso: { titulo: string; texto: string } | null;
  disponibilidade30Dias: string;
  incidentesNoMes: number;
  servicos: Servico[];
  incidentes: Incidente[];
};
