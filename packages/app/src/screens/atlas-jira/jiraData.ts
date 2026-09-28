import { hoursAgo } from '../_shared/environments';

/**
 * Atlas × Jira: issues do GitHub importadas como rascunho e os cards que já
 * viraram Jira.
 *
 * DADOS DE EXEMPLO. O lab não tem a integração com GitHub nem com Jira; a
 * tela avisa isso no topo. Quando houver, as trocas são `loadJira` (ler) e
 * `syncFromGitHub` (importar de novo).
 */

export type IssueType = 'Bug' | 'Melhoria' | 'Tarefa' | 'Dúvida';

export type Draft = {
  id: string;
  /** Repositório e número da issue no GitHub. */
  origin: string;
  /** Quem executou o template/ação que gerou a issue. */
  requester: string;
  title: string;
  type: IssueType;
  importedAt: string;
  body: string;
};

export type JiraCard = {
  key: string;
  title: string;
  type: IssueType;
  status: 'A fazer' | 'Em andamento' | 'Em revisão';
  assignee: string;
  createdAt: string;
  origin: string;
};

const DRAFTS: Draft[] = [
  { id: 'd1', origin: 'atlas-templates#412', requester: 'bruno.lima', title: 'Template RDS não aceita versão 16 do Postgres', type: 'Bug', importedAt: hoursAgo(3), body: 'Ao escolher Postgres 16 no formulário, o plano do Terraform falha com "engine version not supported".' },
  { id: 'd2', origin: 'atlas-templates#409', requester: 'elisa.rocha', title: 'Permitir escolher classe de storage no S3', type: 'Melhoria', importedAt: hoursAgo(8), body: 'Hoje todo bucket nasce como STANDARD. Pedir INTELLIGENT_TIERING como opção.' },
  { id: 'd3', origin: 'atlas-portal#88', requester: 'gabi.torres', title: 'Break Glass: incluir duração de 12 h para incidentes longos', type: 'Melhoria', importedAt: hoursAgo(26), body: 'Incidentes de virada de mês passam de 8 h; hoje é preciso pedir duas vezes.' },
  { id: 'd4', origin: 'atlas-templates#401', requester: 'henrique.dias', title: 'Documentar tags obrigatórias do SQS', type: 'Tarefa', importedAt: hoursAgo(50), body: 'O TechDocs do template não lista as tags que o PR exige.' },
  { id: 'd5', origin: 'atlas-portal#85', requester: 'julia.campos', title: 'Como promover um recurso de ext para prod?', type: 'Dúvida', importedAt: hoursAgo(70), body: 'Não achei o botão de promover para prod no mapa de provisionamento.' },
  { id: 'd6', origin: 'atlas-templates#398', requester: 'diego.alves', title: 'Lambda: timeout máximo vem fixo em 30 s', type: 'Bug', importedAt: hoursAgo(98), body: 'O campo de timeout ignora o valor informado e usa 30 s.' },
];

const CARDS: JiraCard[] = [
  { key: 'ATLAS-231', title: 'Template Valkey com réplica em outra AZ', type: 'Melhoria', status: 'Em andamento', assignee: 'igor.prado', createdAt: hoursAgo(200), origin: 'atlas-templates#380' },
  { key: 'ATLAS-228', title: 'Erro 500 ao registrar componente com anotação vazia', type: 'Bug', status: 'Em revisão', assignee: 'carla.mendes', createdAt: hoursAgo(260), origin: 'atlas-portal#71' },
  { key: 'ATLAS-225', title: 'Padronizar nomes de fila entre ambientes', type: 'Tarefa', status: 'A fazer', assignee: 'fabio.nunes', createdAt: hoursAgo(300), origin: 'atlas-templates#366' },
  { key: 'ATLAS-219', title: 'Mapa de provisionamento: exportar CSV', type: 'Melhoria', status: 'A fazer', assignee: 'ana.souza', createdAt: hoursAgo(400), origin: 'atlas-portal#64' },
];

export async function loadJira(): Promise<{ drafts: Draft[]; cards: JiraCard[] }> {
  return { drafts: DRAFTS.map(d => ({ ...d })), cards: CARDS.map(c => ({ ...c })) };
}

/** No lab, "sincronizar" relê os exemplos — não há GitHub do outro lado. */
export async function syncFromGitHub(): Promise<{ drafts: Draft[]; cards: JiraCard[] }> {
  await new Promise(resolve => setTimeout(resolve, 700));
  return loadJira();
}
