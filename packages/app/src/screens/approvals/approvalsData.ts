import { hoursAgo, type Environment } from '../_shared/environments';

/**
 * Solicitações de provisionamento que passam por aprovação.
 *
 * DADOS DE EXEMPLO. O lab não tem o serviço de aprovações; a tela avisa
 * isso no topo. Quando houver backend, esta é a única troca: `loadApprovals`
 * passa a chamar a API, e a tela não muda.
 */

export type ApprovalStatus = 'pending' | 'running' | 'done' | 'rejected' | 'cancelled' | 'failed';

export type ApprovalItem = {
  id: string;
  /** Em que lista aparece: "Minhas aprovações" (approver) ou "Minhas solicitações" (requester). */
  side: 'approver' | 'requester';
  resource: string;
  template: string;
  environment: Environment;
  group: string;
  owner: string;
  requester: string;
  requestedAt: string;
  approvals: { done: number; required: number };
  approvedBy: string[];
  status: ApprovalStatus;
  justification: string;
  /** Motivo, quando rejeitada ou cancelada. */
  closingNote?: string;
};

const item = (i: Partial<ApprovalItem> & Pick<ApprovalItem, 'id' | 'side' | 'resource'>): ApprovalItem => ({
  template: 'Amazon S3',
  environment: 'dev',
  group: 'pagamentos',
  owner: 'ana.souza',
  requester: 'bruno.lima',
  requestedAt: hoursAgo(5),
  approvals: { done: 0, required: 1 },
  approvedBy: [],
  status: 'pending',
  justification: 'Recurso necessário para o próximo incremento do serviço.',
  ...i,
});

const EXAMPLE: ApprovalItem[] = [
  // --- Minhas aprovações: o que outras pessoas pediram e eu posso aprovar ---
  item({ id: 'a1', side: 'approver', resource: 'pag-conciliacao-db', template: 'Amazon RDS', environment: 'prod', group: 'pagamentos', owner: 'ana.souza', requester: 'bruno.lima', requestedAt: hoursAgo(2), approvals: { done: 1, required: 2 }, approvedBy: ['carla.mendes'], justification: 'Banco da conciliação diária. Plano de capacidade aprovado no ADR-042.' }),
  item({ id: 'a2', side: 'approver', resource: 'onb-documentos-bucket', template: 'Amazon S3', environment: 'ext', group: 'onboarding', owner: 'diego.alves', requester: 'elisa.rocha', requestedAt: hoursAgo(6), justification: 'Armazenar documentos enviados no cadastro de clientes PJ.' }),
  item({ id: 'a3', side: 'approver', resource: 'anf-eventos-fila', template: 'Amazon SQS', environment: 'prod', group: 'antifraude', owner: 'fabio.nunes', requester: 'gabi.torres', requestedAt: hoursAgo(20), approvals: { done: 0, required: 2 }, justification: 'Fila de eventos do motor de regras, com DLQ.' }),
  item({ id: 'a4', side: 'approver', resource: 'pag-cache-sessoes', template: 'ElastiCache Valkey', environment: 'int', group: 'pagamentos', owner: 'ana.souza', requester: 'henrique.dias', requestedAt: hoursAgo(30), approvals: { done: 1, required: 1 }, approvedBy: ['você'], status: 'running' }),
  item({ id: 'a5', side: 'approver', resource: 'btg-bitrago-teste-0004', template: 'Amazon S3', environment: 'perf', group: 'plataforma', owner: 'igor.prado', requester: 'julia.campos', requestedAt: hoursAgo(50), approvals: { done: 1, required: 1 }, approvedBy: ['você'], status: 'done' }),
  item({ id: 'a6', side: 'approver', resource: 'anf-modelo-lambda', template: 'AWS Lambda', environment: 'prdnv', group: 'antifraude', owner: 'fabio.nunes', requester: 'gabi.torres', requestedAt: hoursAgo(75), approvals: { done: 0, required: 2 }, status: 'rejected', closingNote: 'Sem teste de carga no ambiente ext.' }),
  item({ id: 'a7', side: 'approver', resource: 'onb-notificacoes-topico', template: 'Amazon SNS', environment: 'dev', group: 'onboarding', owner: 'diego.alves', requester: 'elisa.rocha', requestedAt: hoursAgo(96), approvals: { done: 1, required: 1 }, approvedBy: ['você'], status: 'done' }),
  item({ id: 'a8', side: 'approver', resource: 'pag-extratos-tabela', template: 'Amazon DynamoDB', environment: 'ext', group: 'pagamentos', owner: 'ana.souza', requester: 'bruno.lima', requestedAt: hoursAgo(1), justification: 'Tabela de extratos consolidados para o app.' }),

  // --- Minhas solicitações: o que eu pedi ---
  item({ id: 's1', side: 'requester', resource: 'plt-logs-bucket', template: 'Amazon S3', environment: 'prod', group: 'plataforma', owner: 'você', requester: 'você', requestedAt: hoursAgo(3), approvals: { done: 1, required: 2 }, approvedBy: ['igor.prado'] }),
  item({ id: 's2', side: 'requester', resource: 'plt-metricas-db', template: 'Amazon RDS', environment: 'int', group: 'plataforma', owner: 'você', requester: 'você', requestedAt: hoursAgo(9), approvals: { done: 1, required: 1 }, approvedBy: ['igor.prado'], status: 'running' }),
  item({ id: 's3', side: 'requester', resource: 'plt-cache-portal', template: 'ElastiCache Valkey', environment: 'dev', group: 'plataforma', owner: 'você', requester: 'você', requestedAt: hoursAgo(28), approvals: { done: 1, required: 1 }, approvedBy: ['julia.campos'], status: 'done' }),
  item({ id: 's4', side: 'requester', resource: 'plt-alertas-topico', template: 'Amazon SNS', environment: 'perf', group: 'plataforma', owner: 'você', requester: 'você', requestedAt: hoursAgo(60), status: 'failed', closingNote: 'Terraform falhou no apply: limite de tópicos da conta.' }),
  item({ id: 's5', side: 'requester', resource: 'plt-jobs-fila', template: 'Amazon SQS', environment: 'ext', group: 'plataforma', owner: 'você', requester: 'você', requestedAt: hoursAgo(12) }),
  item({ id: 's6', side: 'requester', resource: 'plt-relatorios-lambda', template: 'AWS Lambda', environment: 'dev', group: 'plataforma', owner: 'você', requester: 'você', requestedAt: hoursAgo(120), status: 'cancelled', closingNote: 'Substituída por job no ECS.' }),
];

export async function loadApprovals(): Promise<ApprovalItem[]> {
  return EXAMPLE.map(i => ({ ...i, approvals: { ...i.approvals }, approvedBy: [...i.approvedBy] }));
}
