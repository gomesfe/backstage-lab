/**
 * Conteúdo estático da Home, portado de `data.ts` do redesign.
 *
 * O que está aqui é conteúdo editorial — comunicados, links, passos de
 * onboarding — que no Atlas real viria de uma fonte externa (Confluence, um
 * backend de avisos). Números e listas de recursos **não** ficam aqui: esses
 * vêm do catálogo, em `useHomeMetrics`.
 */

export type QuickActionColor =
  | 'provision'
  | 'search'
  | 'resources'
  | 'request'
  | 'breakglass'
  | 'governance'
  | 'templates';

export type QuickAction = {
  id: string;
  label: string;
  color: QuickActionColor;
  /** Rota do portal. `null` quando a tela ainda não existe no lab. */
  to: string | null;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'provision', label: 'Provisionar Recurso', color: 'provision', to: '/create' },
  { id: 'search', label: 'Buscar no Catálogo', color: 'search', to: '/search' },
  { id: 'resources', label: 'Meus Recursos', color: 'resources', to: '/' },
  { id: 'request', label: 'Solicitar Acesso', color: 'request', to: '/admin' },
  { id: 'breakglass', label: 'Break Glass', color: 'breakglass', to: null },
  { id: 'templates', label: 'Templates', color: 'templates', to: '/create' },
  { id: 'governance', label: 'Governança', color: 'governance', to: '/admin' },
];

export const SERVICE_SCOPES = ['Todos', 'Pagamentos', 'Onboarding', 'Antifraude'];

export type GeneralUpdate = {
  id: string;
  text: string;
  linkLabel?: string;
  linkUrl?: string;
};

export const GENERAL_UPDATES: GeneralUpdate[] = [
  {
    id: '1',
    text: 'Template Redis v1.0.0 disponível.',
    linkLabel: 'Como usar',
    linkUrl: '/create',
  },
  {
    id: '2',
    text: 'Template SQS v2.3.0 atualizado com suporte a DLQ.',
    linkLabel: 'Referência',
    linkUrl: '/create',
  },
  {
    id: '3',
    text: 'Novo padrão de tags obrigatórias em recursos AWS.',
    linkLabel: 'Ver template',
    linkUrl: '/create',
  },
  { id: '4', text: 'Manutenção programada do Atlas no domingo, 10/08.' },
  {
    id: '5',
    text: 'Template S3 v1.4.0 disponível.',
    linkLabel: 'Como usar',
    linkUrl: '/create',
  },
];

export const USEFUL_LINKS = [
  { id: '1', label: 'Guia de Onboarding', href: '/docs' },
  { id: '2', label: 'Padrões de Arquitetura', href: '/docs' },
  { id: '3', label: 'Runbooks de Incidente', href: '/docs' },
  { id: '4', label: 'Catálogo de Templates', href: '/create' },
  { id: '5', label: 'Política de Break Glass', href: '/docs' },
];

export const TOOLKIT_TOOLS = [
  { id: 'github', label: 'GitHub', url: 'https://github.com' },
  { id: 'aws', label: 'AWS', url: 'https://console.aws.amazon.com' },
  { id: 'sonarqube', label: 'SonarQube', url: 'https://sonarcloud.io' },
  { id: 'backstage', label: 'Docs do Backstage', url: 'https://backstage.io/docs' },
];

export const ONBOARDING_STEPS = [
  {
    id: '1',
    title: 'Crie seu serviço',
    desc: 'Use um template do scaffolder para provisionar um novo serviço com CI/CD e observabilidade prontos.',
  },
  {
    id: '2',
    title: 'Registre no catálogo',
    desc: 'Adicione o catalog-info.yaml e conecte docs, APIs e dependências do seu componente.',
  },
  {
    id: '3',
    title: 'Ative a governança',
    desc: 'Defina champions, monitore custos e acompanhe drifts detectados no seu escopo.',
  },
];
