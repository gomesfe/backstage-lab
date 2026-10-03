import type { Card, Rascunho } from './types';

/**
 * Rascunhos e cards de exemplo — os mesmos da tela HTML que esta substitui.
 * Com a integração, os rascunhos vêm das issues do GitHub e os cards do Jira
 * (ver `useAtlasJira`).
 */
export const RASCUNHOS: Rascunho[] = [
  {
    id: 'd1',
    origem: 'atlas-templates#412',
    solicitante: 'bruno.lima',
    titulo: 'Oferta RDS não aceita versão 16 do Postgres',
    tipo: 'Bug',
    importadoEm: '29/09/26 09:00',
    descricao:
      'Ao escolher Postgres 16 no formulário, o plano do Terraform falha com "engine version not supported".',
  },
  {
    id: 'd2',
    origem: 'atlas-templates#409',
    solicitante: 'elisa.rocha',
    titulo: 'Permitir escolher classe de storage no S3',
    tipo: 'Melhoria',
    importadoEm: '29/09/26 04:00',
    descricao:
      'Hoje todo bucket nasce como STANDARD. Pedir INTELLIGENT_TIERING como opção.',
  },
  {
    id: 'd3',
    origem: 'atlas-portal#88',
    solicitante: 'gabi.torres',
    titulo: 'Break Glass: incluir duração de 12 h para incidentes longos',
    tipo: 'Melhoria',
    importadoEm: '28/09/26 10:00',
    descricao:
      'Incidentes de virada de mês passam de 8 h; hoje é preciso pedir duas vezes.',
  },
  {
    id: 'd4',
    origem: 'atlas-templates#401',
    solicitante: 'henrique.dias',
    titulo: 'Documentar tags obrigatórias do SQS',
    tipo: 'Tarefa',
    importadoEm: '27/09/26 10:00',
    descricao: 'O TechDocs da oferta não lista as tags que o PR exige.',
  },
  {
    id: 'd5',
    origem: 'atlas-portal#85',
    solicitante: 'julia.campos',
    titulo: 'Como promover um recurso de ext para prod?',
    tipo: 'Dúvida',
    importadoEm: '26/09/26 14:00',
    descricao:
      'Não achei o botão de promover para prod no mapa de provisionamento.',
  },
  {
    id: 'd6',
    origem: 'atlas-templates#398',
    solicitante: 'diego.alves',
    titulo: 'Lambda: timeout máximo vem fixo em 30 s',
    tipo: 'Bug',
    importadoEm: '25/09/26 10:00',
    descricao: 'O campo de timeout ignora o valor informado e usa 30 s.',
  },
];

export const CARDS: Card[] = [
  {
    chave: 'ATLAS-231',
    titulo: 'Oferta Valkey com réplica em outra AZ',
    tipo: 'Melhoria',
    status: 'Em andamento',
    responsavel: 'igor.prado',
    origem: 'atlas-templates#380',
    criadoEm: '21/09/26 04:00',
  },
  {
    chave: 'ATLAS-228',
    titulo: 'Erro 500 ao registrar componente com anotação vazia',
    tipo: 'Bug',
    status: 'Em revisão',
    responsavel: 'carla.mendes',
    origem: 'atlas-portal#71',
    criadoEm: '18/09/26 16:00',
  },
  {
    chave: 'ATLAS-225',
    titulo: 'Padronizar nomes de fila entre ambientes',
    tipo: 'Tarefa',
    status: 'A fazer',
    responsavel: 'fabio.nunes',
    origem: 'atlas-templates#366',
    criadoEm: '17/09/26 00:00',
  },
  {
    chave: 'ATLAS-219',
    titulo: 'Mapa de provisionamento: exportar CSV',
    tipo: 'Melhoria',
    status: 'A fazer',
    responsavel: 'ana.souza',
    origem: 'atlas-portal#64',
    criadoEm: '12/09/26 20:00',
  },
];
