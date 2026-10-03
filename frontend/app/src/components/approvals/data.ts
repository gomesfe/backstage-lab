import type { Solicitacao } from './types';

/**
 * Solicitações de exemplo — as mesmas da tela HTML que esta substitui. Com o
 * serviço de aprovações, troque por uma chamada à API (ver `useApprovals`).
 */

export const SOLICITACOES: Solicitacao[] = [
  {
    id: 'a8',
    lado: 'aprovacao',
    recurso: 'pag-extratos-tabela',
    noMapa: true,
    oferta: 'Amazon DynamoDB',
    ambiente: 'ext',
    grupo: 'pagamentos',
    dono: 'ana.souza',
    solicitante: 'bruno.lima',
    time: 'pagamentos',
    data: '29/09/26 11:00',
    aprovacoes: {
      feitas: 0,
      total: 1,
      por: [],
    },
    status: 'aguardando',
    excluido: false,
    justificativa: 'Tabela de extratos consolidados para o app.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aguardando decisão',
        situacao: 'pendente',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por bruno.lima · 29/09/26 11:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 0 de 1',
        nota: 'Ninguém aprovou ainda.',
        estado: 'agora',
      },
      {
        titulo: 'Aprovação concluída',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow disparado',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow concluído',
        estado: 'pendente',
      },
      {
        titulo: 'Remoção do catálogo iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Recurso removido do catálogo',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção concluída',
        estado: 'pendente',
      },
    ],
  },
  {
    id: 'a1',
    lado: 'aprovacao',
    recurso: 'pag-conciliacao-db',
    noMapa: true,
    oferta: 'Amazon RDS',
    ambiente: 'prod',
    grupo: 'pagamentos',
    dono: 'ana.souza',
    solicitante: 'bruno.lima',
    time: 'pagamentos',
    data: '29/09/26 10:00',
    aprovacoes: {
      feitas: 1,
      total: 2,
      por: ['carla.mendes'],
    },
    status: 'aguardando',
    excluido: false,
    justificativa: 'Banco da conciliação diária. Plano de capacidade aprovado no ADR-042.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aprovado por carla.mendes',
        situacao: 'aprovou',
      },
      {
        nome: 'DevOps',
        nota: 'Aguardando decisão',
        situacao: 'pendente',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por bruno.lima · 29/09/26 10:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin, DevOps',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 1 de 2',
        nota: 'Por carla.mendes.',
        estado: 'agora',
      },
      {
        titulo: 'Aprovação concluída',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow disparado',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow concluído',
        estado: 'pendente',
      },
      {
        titulo: 'Remoção do catálogo iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Recurso removido do catálogo',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção concluída',
        estado: 'pendente',
      },
    ],
  },
  {
    id: 'a2',
    lado: 'aprovacao',
    recurso: 'onb-documentos-bucket',
    noMapa: true,
    oferta: 'Amazon S3',
    ambiente: 'ext',
    grupo: 'onboarding',
    dono: 'diego.alves',
    solicitante: 'elisa.rocha',
    time: 'onboarding',
    data: '29/09/26 06:00',
    aprovacoes: {
      feitas: 0,
      total: 1,
      por: [],
    },
    status: 'aguardando',
    excluido: false,
    justificativa: 'Armazenar documentos enviados no cadastro de clientes PJ.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aguardando decisão',
        situacao: 'pendente',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por elisa.rocha · 29/09/26 06:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 0 de 1',
        nota: 'Ninguém aprovou ainda.',
        estado: 'agora',
      },
      {
        titulo: 'Aprovação concluída',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow disparado',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow concluído',
        estado: 'pendente',
      },
      {
        titulo: 'Remoção do catálogo iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Recurso removido do catálogo',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção concluída',
        estado: 'pendente',
      },
    ],
  },
  {
    id: 'a3',
    lado: 'aprovacao',
    recurso: 'anf-eventos-fila',
    noMapa: true,
    oferta: 'Amazon SQS',
    ambiente: 'prod',
    grupo: 'antifraude',
    dono: 'fabio.nunes',
    solicitante: 'gabi.torres',
    time: 'antifraude',
    data: '28/09/26 16:00',
    aprovacoes: {
      feitas: 0,
      total: 2,
      por: [],
    },
    status: 'aguardando',
    excluido: false,
    justificativa: 'Fila de eventos do motor de regras, com DLQ.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aguardando decisão',
        situacao: 'pendente',
      },
      {
        nome: 'DevOps',
        nota: 'Aguardando decisão',
        situacao: 'pendente',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por gabi.torres · 28/09/26 16:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin, DevOps',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 0 de 2',
        nota: 'Ninguém aprovou ainda.',
        estado: 'agora',
      },
      {
        titulo: 'Aprovação concluída',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow disparado',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow concluído',
        estado: 'pendente',
      },
      {
        titulo: 'Remoção do catálogo iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Recurso removido do catálogo',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção concluída',
        estado: 'pendente',
      },
    ],
  },
  {
    id: 'a4',
    lado: 'aprovacao',
    recurso: 'pag-cache-sessoes',
    noMapa: true,
    oferta: 'ElastiCache Valkey',
    ambiente: 'int',
    grupo: 'pagamentos',
    dono: 'ana.souza',
    solicitante: 'henrique.dias',
    time: 'pagamentos',
    data: '28/09/26 06:00',
    aprovacoes: {
      feitas: 1,
      total: 1,
      por: ['você'],
    },
    status: 'execucao',
    excluido: false,
    justificativa: 'Recurso necessário para o próximo incremento do serviço.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aprovado por você',
        situacao: 'aprovou',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por henrique.dias · 28/09/26 06:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 1 de 1',
        nota: 'Por você · 28/09/26 06:12',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concluída',
        nota: '28/09/26 06:15',
        estado: 'feito',
      },
      {
        titulo: 'Deleção iniciada',
        nota: '28/09/26 06:16',
        estado: 'feito',
      },
      {
        titulo: 'Workflow disparado',
        nota: '28/09/26 06:17',
        estado: 'feito',
      },
      {
        titulo: 'Workflow concluído',
        nota: 'Em andamento.',
        estado: 'agora',
      },
      {
        titulo: 'Remoção do catálogo iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Recurso removido do catálogo',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção concluída',
        estado: 'pendente',
      },
    ],
  },
  {
    id: 'a5',
    lado: 'aprovacao',
    recurso: 'bitrago-teste-0004',
    noMapa: true,
    oferta: 'Amazon S3',
    ambiente: 'perf',
    grupo: 'plataforma',
    dono: 'igor.prado',
    solicitante: 'julia.campos',
    time: 'plataforma',
    data: '27/09/26 10:00',
    aprovacoes: {
      feitas: 1,
      total: 1,
      por: ['você'],
    },
    status: 'concluido',
    excluido: true,
    justificativa: 'Recurso necessário para o próximo incremento do serviço.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aprovado por você',
        situacao: 'aprovou',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por julia.campos · 27/09/26 10:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 1 de 1',
        nota: 'Por você · 27/09/26 10:12',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concluída',
        nota: '27/09/26 10:15',
        estado: 'feito',
      },
      {
        titulo: 'Deleção iniciada',
        nota: '27/09/26 10:16',
        estado: 'feito',
      },
      {
        titulo: 'Workflow disparado',
        nota: '27/09/26 10:17',
        estado: 'feito',
      },
      {
        titulo: 'Workflow concluído',
        nota: '27/09/26 10:23',
        estado: 'feito',
      },
      {
        titulo: 'Remoção do catálogo iniciada',
        nota: '27/09/26 10:24',
        estado: 'feito',
      },
      {
        titulo: 'Recurso removido do catálogo',
        nota: '27/09/26 10:25',
        estado: 'feito',
      },
      {
        titulo: 'Deleção concluída',
        nota: '27/09/26 10:26',
        estado: 'feito',
      },
    ],
  },
  {
    id: 'a6',
    lado: 'aprovacao',
    recurso: 'anf-modelo-lambda',
    noMapa: true,
    oferta: 'AWS Lambda',
    ambiente: 'prdnv',
    grupo: 'antifraude',
    dono: 'fabio.nunes',
    solicitante: 'gabi.torres',
    time: 'antifraude',
    data: '26/09/26 09:00',
    aprovacoes: {
      feitas: 0,
      total: 2,
      por: [],
    },
    status: 'rejeitado',
    excluido: false,
    justificativa: 'Recurso necessário para o próximo incremento do serviço.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Sem teste de carga no ambiente ext.',
        situacao: 'rejeitou',
      },
      {
        nome: 'DevOps',
        nota: 'Não chegou a avaliar',
        situacao: 'sem resposta',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por gabi.torres · 26/09/26 09:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin, DevOps',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação rejeitada',
        nota: 'Sem teste de carga no ambiente ext.',
        estado: 'falhou',
      },
    ],
  },
  {
    id: 'a7',
    lado: 'aprovacao',
    recurso: 'onb-notificacoes-topico',
    noMapa: true,
    oferta: 'Amazon SNS',
    ambiente: 'dev',
    grupo: 'onboarding',
    dono: 'diego.alves',
    solicitante: 'elisa.rocha',
    time: 'onboarding',
    data: '25/09/26 12:00',
    aprovacoes: {
      feitas: 1,
      total: 1,
      por: ['você'],
    },
    status: 'concluido',
    excluido: true,
    justificativa: 'Recurso necessário para o próximo incremento do serviço.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aprovado por você',
        situacao: 'aprovou',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por elisa.rocha · 25/09/26 12:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 1 de 1',
        nota: 'Por você · 25/09/26 12:12',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concluída',
        nota: '25/09/26 12:15',
        estado: 'feito',
      },
      {
        titulo: 'Deleção iniciada',
        nota: '25/09/26 12:16',
        estado: 'feito',
      },
      {
        titulo: 'Workflow disparado',
        nota: '25/09/26 12:17',
        estado: 'feito',
      },
      {
        titulo: 'Workflow concluído',
        nota: '25/09/26 12:23',
        estado: 'feito',
      },
      {
        titulo: 'Remoção do catálogo iniciada',
        nota: '25/09/26 12:24',
        estado: 'feito',
      },
      {
        titulo: 'Recurso removido do catálogo',
        nota: '25/09/26 12:25',
        estado: 'feito',
      },
      {
        titulo: 'Deleção concluída',
        nota: '25/09/26 12:26',
        estado: 'feito',
      },
    ],
  },
  {
    id: 's1',
    lado: 'solicitacao',
    recurso: 'plt-logs-bucket',
    noMapa: true,
    oferta: 'Amazon S3',
    ambiente: 'prod',
    grupo: 'plataforma',
    dono: 'você',
    solicitante: 'você',
    time: 'plataforma',
    data: '29/09/26 09:00',
    aprovacoes: {
      feitas: 1,
      total: 2,
      por: ['igor.prado'],
    },
    status: 'aguardando',
    excluido: false,
    justificativa: 'Recurso necessário para o próximo incremento do serviço.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aprovado por igor.prado',
        situacao: 'aprovou',
      },
      {
        nome: 'DevOps',
        nota: 'Aguardando decisão',
        situacao: 'pendente',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por você · 29/09/26 09:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin, DevOps',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 1 de 2',
        nota: 'Por igor.prado.',
        estado: 'agora',
      },
      {
        titulo: 'Aprovação concluída',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow disparado',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow concluído',
        estado: 'pendente',
      },
      {
        titulo: 'Remoção do catálogo iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Recurso removido do catálogo',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção concluída',
        estado: 'pendente',
      },
    ],
  },
  {
    id: 's2',
    lado: 'solicitacao',
    recurso: 'plt-metricas-db',
    noMapa: true,
    oferta: 'Amazon RDS',
    ambiente: 'int',
    grupo: 'plataforma',
    dono: 'você',
    solicitante: 'você',
    time: 'plataforma',
    data: '29/09/26 03:00',
    aprovacoes: {
      feitas: 1,
      total: 1,
      por: ['igor.prado'],
    },
    status: 'execucao',
    excluido: false,
    justificativa: 'Recurso necessário para o próximo incremento do serviço.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aprovado por igor.prado',
        situacao: 'aprovou',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por você · 29/09/26 03:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 1 de 1',
        nota: 'Por igor.prado · 29/09/26 03:12',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concluída',
        nota: '29/09/26 03:15',
        estado: 'feito',
      },
      {
        titulo: 'Deleção iniciada',
        nota: '29/09/26 03:16',
        estado: 'feito',
      },
      {
        titulo: 'Workflow disparado',
        nota: '29/09/26 03:17',
        estado: 'feito',
      },
      {
        titulo: 'Workflow concluído',
        nota: 'Em andamento.',
        estado: 'agora',
      },
      {
        titulo: 'Remoção do catálogo iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Recurso removido do catálogo',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção concluída',
        estado: 'pendente',
      },
    ],
  },
  {
    id: 's5',
    lado: 'solicitacao',
    recurso: 'plt-jobs-fila',
    noMapa: false,
    oferta: 'Amazon SQS',
    ambiente: 'ext',
    grupo: 'plataforma',
    dono: 'você',
    solicitante: 'você',
    time: 'plataforma',
    data: '29/09/26 00:00',
    aprovacoes: {
      feitas: 0,
      total: 1,
      por: [],
    },
    status: 'aguardando',
    excluido: false,
    justificativa: 'Recurso necessário para o próximo incremento do serviço.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aguardando decisão',
        situacao: 'pendente',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por você · 29/09/26 00:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 0 de 1',
        nota: 'Ninguém aprovou ainda.',
        estado: 'agora',
      },
      {
        titulo: 'Aprovação concluída',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow disparado',
        estado: 'pendente',
      },
      {
        titulo: 'Workflow concluído',
        estado: 'pendente',
      },
      {
        titulo: 'Remoção do catálogo iniciada',
        estado: 'pendente',
      },
      {
        titulo: 'Recurso removido do catálogo',
        estado: 'pendente',
      },
      {
        titulo: 'Deleção concluída',
        estado: 'pendente',
      },
    ],
  },
  {
    id: 's3',
    lado: 'solicitacao',
    recurso: 'plt-cache-portal',
    noMapa: true,
    oferta: 'ElastiCache Valkey',
    ambiente: 'dev',
    grupo: 'plataforma',
    dono: 'você',
    solicitante: 'você',
    time: 'plataforma',
    data: '28/09/26 08:00',
    aprovacoes: {
      feitas: 1,
      total: 1,
      por: ['julia.campos'],
    },
    status: 'concluido',
    excluido: true,
    justificativa: 'Recurso necessário para o próximo incremento do serviço.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aprovado por julia.campos',
        situacao: 'aprovou',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por você · 28/09/26 08:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 1 de 1',
        nota: 'Por julia.campos · 28/09/26 08:12',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concluída',
        nota: '28/09/26 08:15',
        estado: 'feito',
      },
      {
        titulo: 'Deleção iniciada',
        nota: '28/09/26 08:16',
        estado: 'feito',
      },
      {
        titulo: 'Workflow disparado',
        nota: '28/09/26 08:17',
        estado: 'feito',
      },
      {
        titulo: 'Workflow concluído',
        nota: '28/09/26 08:23',
        estado: 'feito',
      },
      {
        titulo: 'Remoção do catálogo iniciada',
        nota: '28/09/26 08:24',
        estado: 'feito',
      },
      {
        titulo: 'Recurso removido do catálogo',
        nota: '28/09/26 08:25',
        estado: 'feito',
      },
      {
        titulo: 'Deleção concluída',
        nota: '28/09/26 08:26',
        estado: 'feito',
      },
    ],
  },
  {
    id: 's4',
    lado: 'solicitacao',
    recurso: 'plt-alertas-topico',
    noMapa: false,
    oferta: 'Amazon SNS',
    ambiente: 'perf',
    grupo: 'plataforma',
    dono: 'você',
    solicitante: 'você',
    time: 'plataforma',
    data: '27/09/26 00:00',
    aprovacoes: {
      feitas: 0,
      total: 1,
      por: [],
    },
    status: 'falhou',
    excluido: false,
    justificativa: 'Recurso necessário para o próximo incremento do serviço.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Aprovado',
        situacao: 'aprovou',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por você · 27/09/26 00:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concedida · 1 de 1',
        nota: '27/09/26 00:12',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação concluída',
        nota: '27/09/26 00:15',
        estado: 'feito',
      },
      {
        titulo: 'Deleção iniciada',
        nota: '27/09/26 00:16',
        estado: 'feito',
      },
      {
        titulo: 'Workflow disparado',
        nota: '27/09/26 00:17',
        estado: 'feito',
      },
      {
        titulo: 'Workflow falhou',
        nota: 'Terraform falhou no apply: limite de tópicos da conta.',
        estado: 'falhou',
      },
    ],
  },
  {
    id: 's6',
    lado: 'solicitacao',
    recurso: 'plt-relatorios-lambda',
    noMapa: false,
    oferta: 'AWS Lambda',
    ambiente: 'dev',
    grupo: 'plataforma',
    dono: 'você',
    solicitante: 'você',
    time: 'plataforma',
    data: '24/09/26 12:00',
    aprovacoes: {
      feitas: 0,
      total: 1,
      por: [],
    },
    status: 'cancelado',
    excluido: false,
    justificativa: 'Recurso necessário para o próximo incremento do serviço.',
    aprovadores: [
      {
        nome: 'admin',
        nota: 'Não chegou a avaliar',
        situacao: 'sem resposta',
      },
    ],
    andamento: [
      {
        titulo: 'Solicitação criada',
        nota: 'Por você · 24/09/26 12:00',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação necessária',
        nota: 'Precisa de: admin',
        estado: 'feito',
      },
      {
        titulo: 'Aprovação automática',
        nota: 'Avaliada: não se aplica, exige aprovação de um grupo.',
        estado: 'feito',
      },
      {
        titulo: 'Solicitação cancelada',
        nota: 'Substituída por job no ECS.',
        estado: 'cancelado',
      },
    ],
  },
];
