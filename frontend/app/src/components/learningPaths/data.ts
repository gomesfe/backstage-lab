import type { Etapa, Trilha } from './types';

/**
 * Conteúdo das trilhas. Fica em código porque o lab não tem um serviço de
 * trilhas — quando houver, este arquivo é o ponto de troca e nada nas telas
 * muda. O progresso de cada pessoa NÃO fica aqui: vive em `useProgresso`.
 */

/*
 * Primeiros passos — TEXTO PROVISÓRIO.
 * Estrutura e títulos seguem o Atlas; o conteúdo é genérico de propósito
 * (sem nomes de canal, links ou contatos inventados). Substitua pelo texto
 * oficial de cada etapa.
 */
const PRIMEIROS_PASSOS: Etapa[] = [
  {
    id: 'cadastro-acesso',
    titulo: 'Cadastro e acesso ao Atlas',
    resumo:
      'Aprenda como se cadastrar e acessar o Atlas para começar a explorar seus recursos.',
    conteudo: [
      {
        titulo: 'Onboard no Atlas',
        paragrafos: [
          'O Atlas é o portal do desenvolvedor: é por ele que você encontra os serviços do seu time, provisiona recursos na nuvem por ofertas e acompanha as suas solicitações.',
          'O acesso é feito com a sua conta corporativa. Não existe usuário e senha próprios do Atlas.',
        ],
      },
      {
        titulo: 'Cadastro e acesso',
        itens: [
          'Entre no Atlas com o login corporativo.',
          'No primeiro acesso, confira em Configurações › Identidade se o seu usuário aparece corretamente.',
          'Verifique em Meus grupos se você já está no grupo do seu squad. Sem grupo, o portal não encontra as suas permissões.',
          'Se não estiver em nenhum grupo, peça a inclusão ao líder do squad.',
        ],
      },
      {
        titulo: 'Pré-requisitos',
        itens: [
          'Conta corporativa ativa.',
          'Estar cadastrado no grupo do squad no catálogo.',
          'Conta no GitHub da organização, vinculada ao seu usuário — as ofertas abrem pull requests em seu nome.',
        ],
      },
      {
        titulo: 'Configurações de DevTeam',
        paragrafos: [
          'O DevTeam é o grupo do seu squad. É ele que define de quem são os serviços e recursos que você cria, e quem aprova as suas solicitações.',
        ],
        itens: [
          'Confirme o nome do DevTeam com o líder do squad antes de criar o primeiro recurso.',
          'Ao usar uma oferta, escolha o DevTeam correto como dono: é ele que aparece no catálogo e no mapa de provisionamento.',
        ],
      },
    ],
  },
  {
    id: 'canais-teams',
    titulo: 'Canais de comunicação do Teams',
    resumo:
      'Saiba onde pedir ajuda, acompanhar avisos e falar com o time de plataforma.',
    conteudo: [
      {
        titulo: 'Para que servem os canais',
        paragrafos: [
          'Dúvidas, avisos de manutenção e novidades do Atlas passam pelo Teams. Estar nos canais certos evita que você descubra uma manutenção no meio de um deploy.',
        ],
      },
      {
        titulo: 'Onde pedir ajuda',
        itens: [
          'Dúvidas de uso do portal e das ofertas: canal de suporte do Atlas.',
          'Problema com um recurso já provisionado: abra o pedido no canal de suporte informando o nome do recurso e o ambiente.',
          'Incidente em produção: siga o processo de incidente do seu squad; o Break Glass é para acesso emergencial.',
        ],
      },
      {
        titulo: 'Avisos e manutenções',
        paragrafos: [
          'Janelas de manutenção e versões novas de ofertas são anunciadas no canal de avisos. Ative as notificações dele.',
        ],
      },
      {
        titulo: 'Boas práticas',
        itens: [
          'Antes de perguntar, busque no canal e na documentação (Docs).',
          'Inclua o link da tarefa da oferta ou da solicitação em Aprovações.',
          'Mantenha uma pergunta por thread.',
        ],
      },
    ],
  },
  {
    id: 'vdi-linux',
    titulo: 'Solicitação de VDI Linux',
    resumo:
      'Peça a sua VDI Linux, o ambiente de desenvolvimento padrão para trabalhar com os serviços.',
    conteudo: [
      {
        titulo: 'O que é a VDI',
        paragrafos: [
          'A VDI (Virtual Desktop Infrastructure) é uma máquina Linux virtual, já na rede da empresa e com as ferramentas de desenvolvimento aprovadas. É nela que você clona repositórios e roda os serviços.',
        ],
      },
      {
        titulo: 'Como solicitar',
        itens: [
          'Abra a solicitação de VDI Linux no portal de serviços de TI.',
          'Informe o seu squad e o perfil de desenvolvimento.',
          'Acompanhe o pedido até a liberação — o prazo depende da fila de TI.',
        ],
      },
      {
        titulo: 'Pré-requisitos',
        itens: [
          'Cadastro e acesso ao Atlas concluídos.',
          'Aprovação do líder do squad, quando exigida.',
        ],
      },
      {
        titulo: 'Depois da liberação',
        itens: [
          'Configure o Git com o seu usuário da organização.',
          'Clone o repositório de um serviço do seu time e rode-o localmente.',
          'Volte ao Atlas e siga a trilha de provisionamento.',
        ],
      },
    ],
  },
];

const ONBOARDING: Etapa[] = [
  {
    id: '1',
    titulo: 'Solicite seu acesso',
    resumo:
      'Peça acesso ao grupo do seu squad. Sem estar num Group do catálogo, o RBAC não encontra suas permissões.',
  },
  {
    id: '2',
    titulo: 'Explore o catálogo',
    resumo:
      'Encontre os serviços do seu time e entenda as dependências entre eles.',
  },
  {
    id: '3',
    titulo: 'Provisione um serviço',
    resumo: 'Use uma oferta para criar seu primeiro componente.',
  },
  {
    id: '4',
    titulo: 'Publique a documentação',
    resumo: 'Adicione TechDocs ao catalog-info.yaml do seu componente.',
  },
];

const PROVISIONAMENTO: Etapa[] = [
  {
    id: '1',
    titulo: 'Entenda os tipos de oferta',
    resumo:
      'Recurso AWS, entidade de catálogo, repositório novo e tela do portal — cada uma tem um molde.',
  },
  {
    id: '2',
    titulo: 'Rode uma oferta em modo local',
    resumo:
      'Com atlas.provisioning.mode=local, o fluxo inteiro roda sem token e sem repositório alvo.',
  },
  {
    id: '3',
    titulo: 'Leia o Terraform gerado',
    resumo:
      'Confira backend, convenção de nome e tags antes de abrir o PR de verdade.',
  },
  {
    id: '4',
    titulo: 'Abra o PR',
    resumo:
      'O portal não aplica nada: quem roda o apply é o pipeline do repositório de infraestrutura.',
  },
];

const SEGURANCA: Etapa[] = [
  {
    id: '1',
    titulo: 'Entenda o rbac-policy.csv',
    resumo:
      'Deny ganha de allow e o padrão é fechado — é o que torna o arquivo auditável.',
  },
  {
    id: '2',
    titulo: 'Emita uma API key',
    resumo:
      'Chaves têm TTL e só o hash é guardado. O segredo aparece uma única vez.',
  },
  {
    id: '3',
    titulo: 'Conheça o Break Glass',
    resumo:
      'Acesso privilegiado temporário, sempre auditado, apenas durante incidentes.',
  },
];

export const TRILHAS: Trilha[] = [
  {
    id: 'primeiros-passos',
    titulo: 'Primeiros passos',
    descricao:
      'Cadastro e acesso ao Atlas, canais do Teams e a sua VDI Linux — o básico da primeira semana.',
    dificuldade: 'Iniciante',
    temas: ['Onboarding'],
    etapas: PRIMEIROS_PASSOS,
  },
  {
    id: 'onboarding-dev',
    titulo: 'Onboarding de desenvolvedor',
    descricao:
      'Do zero ao primeiro serviço: acesso, catálogo e documentação no portal.',
    dificuldade: 'Iniciante',
    temas: ['Onboarding'],
    etapas: ONBOARDING,
  },
  {
    id: 'provisioning',
    titulo: 'Provisionamento com o scaffolder',
    descricao:
      'Crie serviços e recursos usando ofertas e as convenções de IaC da casa.',
    dificuldade: 'Intermediário',
    temas: ['Provisionamento', 'AWS'],
    etapas: PROVISIONAMENTO,
  },
  {
    id: 'security',
    titulo: 'Permissões, chaves e break glass',
    descricao:
      'Como o RBAC decide, como emitir credenciais e como pedir acesso emergencial.',
    dificuldade: 'Avançado',
    temas: ['Segurança'],
    etapas: SEGURANCA,
  },
];
