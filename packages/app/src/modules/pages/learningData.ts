/**
 * Trilhas de aprendizado.
 *
 * Conteúdo editorial, portado de `mockData.ts` do redesign. Fica em código
 * porque no lab não há um serviço de trilhas — quando houver, este arquivo é
 * o ponto de troca, e nada nas telas muda.
 */

export type LearningStep = {
  id: string;
  title: string;
  desc: string;
  done: boolean;
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

const ONBOARDING_STEPS: LearningStep[] = [
  {
    id: '1',
    title: 'Solicite seu acesso',
    desc: 'Peça acesso ao grupo do seu squad. Sem estar num Group do catálogo, o RBAC não encontra suas permissões.',
    done: true,
  },
  {
    id: '2',
    title: 'Explore o catálogo',
    desc: 'Encontre os serviços do seu time e entenda as dependências entre eles.',
    done: true,
  },
  {
    id: '3',
    title: 'Provisione um serviço',
    desc: 'Use um template do scaffolder para criar seu primeiro componente.',
    done: false,
  },
  {
    id: '4',
    title: 'Publique a documentação',
    desc: 'Adicione TechDocs ao catalog-info.yaml do seu componente.',
    done: false,
  },
];

const PROVISIONING_STEPS: LearningStep[] = [
  {
    id: '1',
    title: 'Entenda as formas de template',
    desc: 'Recurso AWS, entidade de catálogo, repositório novo e tela do portal — cada uma tem um molde.',
    done: false,
  },
  {
    id: '2',
    title: 'Rode um template em modo local',
    desc: 'Com atlas.provisioning.mode=local, o fluxo inteiro roda sem token e sem repositório alvo.',
    done: false,
  },
  {
    id: '3',
    title: 'Leia o Terraform gerado',
    desc: 'Confira backend, convenção de nome e tags antes de abrir o PR de verdade.',
    done: false,
  },
  {
    id: '4',
    title: 'Abra o PR',
    desc: 'O portal não aplica nada: quem roda o apply é o pipeline do repositório de infraestrutura.',
    done: false,
  },
];

const SECURITY_STEPS: LearningStep[] = [
  {
    id: '1',
    title: 'Entenda o rbac-policy.csv',
    desc: 'Deny ganha de allow e o padrão é fechado — é o que torna o arquivo auditável.',
    done: false,
  },
  {
    id: '2',
    title: 'Emita uma API key',
    desc: 'Chaves têm TTL e só o hash é guardado. O segredo aparece uma única vez.',
    done: false,
  },
  {
    id: '3',
    title: 'Conheça o Break Glass',
    desc: 'Acesso privilegiado temporário, sempre auditado, apenas durante incidentes.',
    done: false,
  },
];

export const LEARNING_PATHS: LearningPath[] = [
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
