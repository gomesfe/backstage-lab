import { contem } from '../shared/filtros';
import type { Card, Rascunho, StatusCard, TipoIssue } from './types';

export const TIPOS: TipoIssue[] = ['Bug', 'Melhoria', 'Tarefa', 'Dúvida'];

export type Tom = 'danger' | 'lime' | 'info' | 'purple' | 'warning';

export const TOM_TIPO: Record<TipoIssue, Tom> = {
  Bug: 'danger',
  Melhoria: 'lime',
  Tarefa: 'info',
  Dúvida: 'purple',
};

export const TOM_STATUS: Record<StatusCard, Tom> = {
  'A fazer': 'info',
  'Em andamento': 'warning',
  'Em revisão': 'purple',
};

export function filtrarRascunhos(
  rascunhos: Rascunho[],
  busca: string,
  tipo: string,
): Rascunho[] {
  return rascunhos.filter(
    rascunho =>
      (!busca.trim() ||
        contem(
          `${rascunho.titulo} ${rascunho.origem} ${rascunho.solicitante}`,
          busca,
        )) &&
      (!tipo || rascunho.tipo === tipo),
  );
}

export function filtrarCards(
  cards: Card[],
  busca: string,
  tipo: string,
): Card[] {
  return cards.filter(
    card =>
      (!busca.trim() ||
        contem(
          `${card.chave} ${card.titulo} ${card.origem} ${card.responsavel}`,
          busca,
        )) &&
      (!tipo || card.tipo === tipo),
  );
}

/** Próxima chave do Jira: ATLAS-<maior + 1>. */
export function proximaChave(cards: Card[]): string {
  const numeros = cards.map(card => Number(card.chave.split('-')[1]) || 0);
  return `ATLAS-${Math.max(0, ...numeros) + 1}`;
}

/** Link da issue no GitHub: `atlas-templates#412` → .../atlas-templates/issues/412. */
export function linkDaIssue(origem: string): string {
  const [repositorio, numero] = origem.split('#');
  return `https://github.com/NucleaSA/${repositorio}/issues/${numero}`;
}

/** Date → "29/09/26 11:00". */
export function agoraFormatado(data: Date = new Date()): string {
  const dois = (valor: number) => String(valor).padStart(2, '0');
  return `${dois(data.getDate())}/${dois(data.getMonth() + 1)}/${dois(
    data.getFullYear() % 100,
  )} ${dois(data.getHours())}:${dois(data.getMinutes())}`;
}
