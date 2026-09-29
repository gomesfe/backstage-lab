import { hoursAgo, type Environment } from '../_shared/environments';

/**
 * O que está provisionado, em que ambiente, por qual template.
 *
 * DADOS DE EXEMPLO. O lab não tem o inventário de provisionamento (no Atlas
 * ele vem do estado do Terraform e dos PRs de IaC); a tela avisa isso no
 * topo. Quando houver fonte, a troca é só em `loadProvisioning`.
 */

export type EnvState = {
  provisionedAt: string;
  /** Pedido em andamento sobre este ambiente. */
  pending?: 'deletion' | 'promotion';
};

export type ProvisionedResource = {
  id: string;
  name: string;
  /** Gerenciado por IaC (Terraform) — o que o Atlas provisiona. */
  iac: boolean;
  /** Sigla do serviço Núclea dono do recurso. */
  service: string;
  template: string;
  repository: string;
  environments: Partial<Record<Environment, EnvState>>;
};

export type Repository = {
  id: string;
  name: string;
  service: string;
  template: string;
  resources: number;
  createdAt: string;
  visibility: 'interno' | 'privado';
};

export const SERVICES: Record<string, string> = {
  BTG: 'Bitrago',
  PAG: 'Pagamentos',
  ONB: 'Onboarding',
  ANF: 'Antifraude',
  PLT: 'Plataforma',
};

/** Regra: exclusão pedida até 72 h depois de provisionar não precisa de aprovação. */
export const FREE_DELETE_WINDOW_HOURS = 72;
/** Regra: promover para estes ambientes passa pelo time de cloud. */
export const CLOUD_APPROVAL_ENVS: Environment[] = ['prod', 'prdnv'];

const env = (hours: number, pending?: EnvState['pending']): EnvState => ({ provisionedAt: hoursAgo(hours), pending });

const RESOURCES: ProvisionedResource[] = [
  { id: 'r1', name: 'bitrago-teste-0004', iac: true, service: 'BTG', template: 'Amazon S3', repository: 'btg-bitrago-infra', environments: { dev: env(20) } },
  { id: 'r2', name: 'bitrago-arquivos', iac: true, service: 'BTG', template: 'Amazon S3', repository: 'btg-bitrago-infra', environments: { dev: env(900), perf: env(700), int: env(500), prod: env(300) } },
  { id: 'r3', name: 'pag-conciliacao-db', iac: true, service: 'PAG', template: 'Amazon RDS', repository: 'pag-conciliacao-infra', environments: { dev: env(1200), perf: env(1100), int: env(1000), ext: env(800), prod: env(600, 'promotion') } },
  { id: 'r4', name: 'pag-extratos-tabela', iac: true, service: 'PAG', template: 'Amazon DynamoDB', repository: 'pag-extratos-infra', environments: { dev: env(50), int: env(30) } },
  { id: 'r5', name: 'pag-cache-sessoes', iac: true, service: 'PAG', template: 'ElastiCache Valkey', repository: 'pag-conciliacao-infra', environments: { dev: env(400), perf: env(350), int: env(300), ext: env(200), prod: env(150), prdnv: env(100) } },
  { id: 'r6', name: 'onb-documentos-bucket', iac: true, service: 'ONB', template: 'Amazon S3', repository: 'onb-cadastro-infra', environments: { dev: env(240), int: env(120, 'deletion') } },
  { id: 'r7', name: 'onb-notificacoes-topico', iac: true, service: 'ONB', template: 'Amazon SNS', repository: 'onb-cadastro-infra', environments: { dev: env(10) } },
  { id: 'r8', name: 'anf-eventos-fila', iac: true, service: 'ANF', template: 'Amazon SQS', repository: 'anf-motor-infra', environments: { dev: env(600), perf: env(500), int: env(450), ext: env(400) } },
  { id: 'r9', name: 'anf-modelo-lambda', iac: true, service: 'ANF', template: 'AWS Lambda', repository: 'anf-motor-infra', environments: { dev: env(60), perf: env(40) } },
  { id: 'r10', name: 'plt-logs-bucket', iac: true, service: 'PLT', template: 'Amazon S3', repository: 'plt-observabilidade-infra', environments: { dev: env(2000), perf: env(1900), int: env(1800), ext: env(1700), prod: env(1600), prdnv: env(1500) } },
  { id: 'r11', name: 'plt-metricas-db', iac: true, service: 'PLT', template: 'Amazon RDS', repository: 'plt-observabilidade-infra', environments: { dev: env(300), int: env(9) } },
  { id: 'r12', name: 'plt-cache-portal', iac: true, service: 'PLT', template: 'ElastiCache Valkey', repository: 'plt-portal-infra', environments: { dev: env(28) } },
  { id: 'r13', name: 'plt-bastion-legado', iac: false, service: 'PLT', template: 'Amazon EC2', repository: '—', environments: { dev: env(5000), prod: env(4800) } },
  { id: 'r14', name: 'btg-relatorios-fila', iac: true, service: 'BTG', template: 'Amazon SQS', repository: 'btg-bitrago-infra', environments: { dev: env(70), perf: env(66) } },
];

const REPOSITORIES: Repository[] = [
  { id: 'g1', name: 'btg-bitrago-infra', service: 'BTG', template: 'Repositório de IaC', resources: 3, createdAt: hoursAgo(2400), visibility: 'interno' },
  { id: 'g2', name: 'btg-bitrago-api', service: 'BTG', template: 'Serviço Node.js', resources: 0, createdAt: hoursAgo(2300), visibility: 'interno' },
  { id: 'g3', name: 'pag-conciliacao-infra', service: 'PAG', template: 'Repositório de IaC', resources: 2, createdAt: hoursAgo(3000), visibility: 'privado' },
  { id: 'g4', name: 'pag-conciliacao-worker', service: 'PAG', template: 'Serviço Java', resources: 0, createdAt: hoursAgo(2900), visibility: 'privado' },
  { id: 'g5', name: 'pag-extratos-infra', service: 'PAG', template: 'Repositório de IaC', resources: 1, createdAt: hoursAgo(120), visibility: 'privado' },
  { id: 'g6', name: 'onb-cadastro-infra', service: 'ONB', template: 'Repositório de IaC', resources: 2, createdAt: hoursAgo(1500), visibility: 'interno' },
  { id: 'g7', name: 'onb-cadastro-web', service: 'ONB', template: 'Frontend React', resources: 0, createdAt: hoursAgo(1400), visibility: 'interno' },
  { id: 'g8', name: 'anf-motor-infra', service: 'ANF', template: 'Repositório de IaC', resources: 2, createdAt: hoursAgo(1000), visibility: 'privado' },
  { id: 'g9', name: 'plt-observabilidade-infra', service: 'PLT', template: 'Repositório de IaC', resources: 2, createdAt: hoursAgo(4000), visibility: 'interno' },
  { id: 'g10', name: 'plt-portal-infra', service: 'PLT', template: 'Repositório de IaC', resources: 1, createdAt: hoursAgo(200), visibility: 'interno' },
];

export async function loadProvisioning(): Promise<{ resources: ProvisionedResource[]; repositories: Repository[] }> {
  return {
    resources: RESOURCES.map(r => ({ ...r, environments: { ...r.environments } })),
    repositories: REPOSITORIES.map(r => ({ ...r })),
  };
}
