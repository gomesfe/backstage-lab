import type { StatusPlataforma } from './types';

/**
 * Status de exemplo — o mesmo da tela HTML que esta substitui. Com dado real,
 * a situação vem dos health checks do backend e os incidentes, do histórico
 * do time de plataforma (ver `usePlatformStatus`).
 */
export const STATUS: StatusPlataforma = {
  time: 'team-plataforma',
  aviso: {
    titulo: 'Desempenho degradado no TechDocs',
    texto:
      'Publicações novas de documentação estão demorando até 15 minutos. Leitura normal. Os demais serviços estão operacionais.',
  },
  disponibilidade30Dias: '99,8%',
  incidentesNoMes: 2,
  servicos: [
    { nome: 'Catálogo', chave: 'catalog', descricao: 'leitura e ingestão de entidades', disponibilidade: '99,98%', situacao: 'operacional' },
    { nome: 'Scaffolder', chave: 'scaffolder', descricao: 'execução das ofertas', disponibilidade: '99,95%', situacao: 'operacional' },
    { nome: 'TechDocs', chave: 'techdocs', descricao: 'build e leitura de docs', disponibilidade: '98,70%', situacao: 'degradado' },
    { nome: 'Busca', chave: 'search', descricao: 'índice de catálogo e docs', disponibilidade: '99,99%', situacao: 'operacional' },
    { nome: 'Login GitHub', chave: 'auth', descricao: 'provedor OAuth', disponibilidade: '100%', situacao: 'operacional' },
    { nome: 'API Keys', chave: 'api-keys', descricao: 'emissão e validação', disponibilidade: '99,97%', situacao: 'operacional' },
    { nome: 'Banco de dados', chave: 'postgres', descricao: 'armazenamento do portal', disponibilidade: '100%', situacao: 'operacional' },
  ],
  incidentes: [
    {
      titulo: 'Build de TechDocs lento',
      descricao: 'Em andamento desde 10:20. Os docs abrem, mas publicações novas demoram até 15 min.',
      quando: '25/09 · 10:20',
      emAndamento: true,
    },
    {
      titulo: 'Falha na ingestão do catálogo',
      descricao: 'Resolvido. Token do GitHub expirado; renovado e ingestão reprocessada.',
      quando: '18/09 · 14:05 — 14:48',
      emAndamento: false,
    },
    {
      titulo: 'Manutenção programada',
      descricao: 'Atualização do Backstage para a versão 1.43. Sem indisponibilidade.',
      quando: '10/08 · 02:00 — 03:10',
      emAndamento: false,
    },
  ],
};
