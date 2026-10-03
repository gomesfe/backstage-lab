import type { Atividade, Mensagem } from './api';

export const SUGESTOES = [
  'Quais ofertas existem para criar um banco de dados?',
  'Quais APIs estão registradas no catálogo e quem é dono de cada uma?',
  'Como peço acesso emergencial a uma conta AWS?',
  'Por onde começo se acabei de entrar no time?',
];

/** Resposta sendo escrita: o texto que já chegou e as consultas feitas. */
export type Pendente = { texto: string; atividade: Atividade[] };

/** Mensagem na tela: as do servidor, mais erro e resposta interrompida. */
export type MensagemLocal = Mensagem & { erro?: boolean; interrompida?: boolean };

/** "agora", "há 5 min", "há 3 h", "ontem", "12/09". */
export function quando(iso: string, agora: number = Date.now()): string {
  const minutos = Math.round((agora - Date.parse(iso)) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  if (minutos < 24 * 60) return `há ${Math.round(minutos / 60)} h`;
  if (minutos < 48 * 60) return 'ontem';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** "Ana Souza" → "AS". */
export function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .map(parte => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function mensagemDeErro(texto: string): MensagemLocal {
  return { id: `erro-${Date.now()}`, role: 'assistant', content: texto, activity: [], createdAt: new Date().toISOString(), erro: true };
}
