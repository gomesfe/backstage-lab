/**
 * Conteúdo editorial da Home — times e champions, novidades, o que vem por
 * aí e links úteis. Os números, as aplicações, o que está provisionado e as
 * transações vêm das fontes de verdade (ver `hooks/`).
 */

export type Time = { id: string; nome: string; champion: string };

export const TIMES: Time[] = [
  { id: 'plataforma', nome: 'Plataforma', champion: 'Ana Souza' },
  { id: 'pagamentos', nome: 'Pagamentos', champion: 'Carla Mendes' },
  { id: 'onboarding', nome: 'Onboarding', champion: 'Diego Rocha' },
  { id: 'antifraude', nome: 'Antifraude', champion: 'Larissa Prado' },
  { id: 'bitrago', nome: 'Bitrago', champion: 'Matheus da Costa' },
];

export const TIME_PADRAO = 'plataforma';

export type Atualizacao = {
  texto: string;
  link?: { rotulo: string; para: string };
};

export const ATUALIZACOES: Atualizacao[] = [
  {
    texto: 'Oferta Redis v1.0.0 disponível.',
    link: { rotulo: 'Como usar ↗', para: '/create' },
  },
  {
    texto: 'Oferta SQS v2.3.0 atualizada com suporte a DLQ.',
    link: { rotulo: 'Referência ↗', para: '/create' },
  },
  {
    texto: 'Novo padrão de tags obrigatórias em recursos AWS.',
    link: { rotulo: 'Ver oferta ↗', para: '/create' },
  },
  { texto: 'Manutenção programada do Atlas no domingo, 10/08.' },
  {
    texto: 'Oferta S3 v1.4.0 disponível.',
    link: { rotulo: 'Como usar ↗', para: '/create' },
  },
];

export const EM_BREVE: { nome: string; descricao: string }[] = [
  {
    nome: 'Provisionar pelo chat',
    descricao: 'Peça o recurso na caixa de pergunta da home.',
  },
  {
    nome: 'Solicitar acesso',
    descricao: 'Peça entrada num grupo sem sair do Atlas.',
  },
];

export const LINKS_UTEIS: { rotulo: string; para: string }[] = [
  { rotulo: 'Guia de Onboarding ↗', para: '/docs' },
  { rotulo: 'Padrões de Arquitetura ↗', para: '/docs' },
  { rotulo: 'Runbooks de Incidente ↗', para: '/docs' },
  { rotulo: 'Catálogo de ofertas ↗', para: '/create' },
  { rotulo: 'Política de Break Glass ↗', para: '/docs' },
  { rotulo: 'Trilhas de aprendizado ↗', para: '/learning-paths' },
];
