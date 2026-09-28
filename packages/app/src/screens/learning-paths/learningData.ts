/**
 * Trilhas de aprendizado.
 *
 * Conteúdo editorial, portado de `mockData.ts` do redesign. Fica em código
 * porque no lab não há um serviço de trilhas — quando houver, este arquivo é
 * o ponto de troca, e nada nas telas muda.
 *
 * O progresso de cada pessoa NÃO fica aqui: o redesign marcava etapas como
 * feitas no próprio conteúdo, igual para todo mundo. Ele vive em
 * `useProgress.ts`.
 */

/** Um bloco do texto que abre no pop-up da etapa. */
export type ContentBlock = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
};

export type LearningStep = {
  id: string;
  title: string;
  /** Resumo que aparece na lista de etapas. */
  desc: string;
  /** Texto completo, aberto no pop-up. Sem ele o pop-up mostra só o resumo. */
  content?: ContentBlock[];
};

export type LearningPath = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  tags: string[];
  steps: LearningStep[];
};

export const LEARNING_TAGS = [
  'Onboarding',
  'Provisionamento',
  'AWS',
  'Segurança',
  'Observabilidade',
  'APIs',
];

/*
 * Primeiros passos — TEXTO PROVISÓRIO.
 * Estrutura e títulos seguem o Atlas; o conteúdo é genérico de propósito
 * (sem nomes de canal, links ou contatos inventados). Substitua pelo texto
 * oficial de cada etapa.
 */
const FIRST_STEPS: LearningStep[] = [
  {
    id: 'cadastro-acesso',
    title: 'Cadastro e acesso ao Atlas',
    desc: 'Aprenda como se cadastrar e acessar o Atlas para começar a explorar seus recursos.',
    content: [
      {
        heading: 'Onboard no Atlas',
        paragraphs: [
          'O Atlas é o portal do desenvolvedor: é por ele que você encontra os serviços do seu time, provisiona recursos na nuvem por templates e acompanha as suas solicitações.',
          'O acesso é feito com a sua conta corporativa. Não existe usuário e senha próprios do Atlas.',
        ],
      },
      {
        heading: 'Cadastro e acesso',
        items: [
          'Entre no Atlas com o login corporativo.',
          'No primeiro acesso, confira em Configurações › Identidade se o seu usuário aparece corretamente.',
          'Verifique em Meus grupos se você já está no grupo do seu squad. Sem grupo, o portal não encontra as suas permissões.',
          'Se não estiver em nenhum grupo, peça a inclusão ao líder do squad.',
        ],
      },
      {
        heading: 'Pré-requisitos',
        items: [
          'Conta corporativa ativa.',
          'Estar cadastrado no grupo do squad no catálogo.',
          'Conta no GitHub da organização, vinculada ao seu usuário — os templates abrem pull requests em seu nome.',
        ],
      },
      {
        heading: 'Configurações de DevTeam',
        paragraphs: [
          'O DevTeam é o grupo do seu squad. É ele que define de quem são os serviços e recursos que você cria, e quem aprova as suas solicitações.',
        ],
        items: [
          'Confirme o nome do DevTeam com o líder do squad antes de criar o primeiro recurso.',
          'Ao usar um template, escolha o DevTeam correto como dono: é ele que aparece no catálogo e no mapa de provisionamento.',
        ],
      },
    ],
  },
  {
    id: 'canais-teams',
    title: 'Canais de comunicação do Teams',
    desc: 'Saiba onde pedir ajuda, acompanhar avisos e falar com o time de plataforma.',
    content: [
      {
        heading: 'Para que servem os canais',
        paragraphs: [
          'Dúvidas, avisos de manutenção e novidades do Atlas passam pelo Teams. Estar nos canais certos evita que você descubra uma manutenção no meio de um deploy.',
        ],
      },
      {
        heading: 'Onde pedir ajuda',
        items: [
          'Dúvidas de uso do portal e dos templates: canal de suporte do Atlas.',
          'Problema com um recurso já provisionado: abra o pedido no canal de suporte informando o nome do recurso e o ambiente.',
          'Incidente em produção: siga o processo de incidente do seu squad; o Break Glass é para acesso emergencial.',
        ],
      },
      {
        heading: 'Avisos e manutenções',
        paragraphs: [
          'Janelas de manutenção e versões novas de templates são anunciadas no canal de avisos. Ative as notificações dele.',
        ],
      },
      {
        heading: 'Boas práticas',
        items: [
          'Antes de perguntar, busque no canal e na documentação (Docs).',
          'Inclua o link da tarefa do Create ou da solicitação em Aprovações.',
          'Mantenha uma pergunta por thread.',
        ],
      },
    ],
  },
  {
    id: 'vdi-linux',
    title: 'Solicitação de VDI Linux',
    desc: 'Peça a sua VDI Linux, o ambiente de desenvolvimento padrão para trabalhar com os serviços.',
    content: [
      {
        heading: 'O que é a VDI',
        paragraphs: [
          'A VDI (Virtual Desktop Infrastructure) é uma máquina Linux virtual, já na rede da empresa e com as ferramentas de desenvolvimento aprovadas. É nela que você clona repositórios e roda os serviços.',
        ],
      },
      {
        heading: 'Como solicitar',
        items: [
          'Abra a solicitação de VDI Linux no portal de serviços de TI.',
          'Informe o seu squad e o perfil de desenvolvimento.',
          'Acompanhe o pedido até a liberação — o prazo depende da fila de TI.',
        ],
      },
      {
        heading: 'Pré-requisitos',
        items: ['Cadastro e acesso ao Atlas concluídos.', 'Aprovação do líder do squad, quando exigida.'],
      },
      {
        heading: 'Depois da liberação',
        items: [
          'Configure o Git com o seu usuário da organização.',
          'Clone o repositório de um serviço do seu time e rode-o localmente.',
          'Volte ao Atlas e siga a trilha de provisionamento.',
        ],
      },
    ],
  },
];

const ONBOARDING_STEPS: LearningStep[] = [
  {
    id: '1',
    title: 'Solicite seu acesso',
    desc: 'Peça acesso ao grupo do seu squad. Sem estar num Group do catálogo, o RBAC não encontra suas permissões.',
  },
  {
    id: '2',
    title: 'Explore o catálogo',
    desc: 'Encontre os serviços do seu time e entenda as dependências entre eles.',
  },
  {
    id: '3',
    title: 'Provisione um serviço',
    desc: 'Use um template do scaffolder para criar seu primeiro componente.',
  },
  {
    id: '4',
    title: 'Publique a documentação',
    desc: 'Adicione TechDocs ao catalog-info.yaml do seu componente.',
  },
];

const PROVISIONING_STEPS: LearningStep[] = [
  {
    id: '1',
    title: 'Entenda as formas de template',
    desc: 'Recurso AWS, entidade de catálogo, repositório novo e tela do portal — cada uma tem um molde.',
  },
  {
    id: '2',
    title: 'Rode um template em modo local',
    desc: 'Com atlas.provisioning.mode=local, o fluxo inteiro roda sem token e sem repositório alvo.',
  },
  {
    id: '3',
    title: 'Leia o Terraform gerado',
    desc: 'Confira backend, convenção de nome e tags antes de abrir o PR de verdade.',
  },
  {
    id: '4',
    title: 'Abra o PR',
    desc: 'O portal não aplica nada: quem roda o apply é o pipeline do repositório de infraestrutura.',
  },
];

const SECURITY_STEPS: LearningStep[] = [
  {
    id: '1',
    title: 'Entenda o rbac-policy.csv',
    desc: 'Deny ganha de allow e o padrão é fechado — é o que torna o arquivo auditável.',
  },
  {
    id: '2',
    title: 'Emita uma API key',
    desc: 'Chaves têm TTL e só o hash é guardado. O segredo aparece uma única vez.',
  },
  {
    id: '3',
    title: 'Conheça o Break Glass',
    desc: 'Acesso privilegiado temporário, sempre auditado, apenas durante incidentes.',
  },
];

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'primeiros-passos',
    title: 'Primeiros passos',
    description: 'Cadastro e acesso ao Atlas, canais do Teams e a sua VDI Linux — o básico da primeira semana.',
    difficulty: 'Iniciante',
    tags: ['Onboarding'],
    steps: FIRST_STEPS,
  },
  {
    id: 'onboarding-dev',
    title: 'Onboarding de desenvolvedor',
    description:
      'Do zero ao primeiro serviço: acesso, catálogo e documentação no portal.',
    difficulty: 'Iniciante',
    tags: ['Onboarding'],
    steps: ONBOARDING_STEPS,
  },
  {
    id: 'provisioning',
    title: 'Provisionamento com o scaffolder',
    description:
      'Crie serviços e recursos usando templates e as convenções de IaC da casa.',
    difficulty: 'Intermediário',
    tags: ['Provisionamento', 'AWS'],
    steps: PROVISIONING_STEPS,
  },
  {
    id: 'security',
    title: 'Permissões, chaves e break glass',
    description:
      'Como o RBAC decide, como emitir credenciais e como pedir acesso emergencial.',
    difficulty: 'Avançado',
    tags: ['Segurança'],
    steps: SECURITY_STEPS,
  },
];
