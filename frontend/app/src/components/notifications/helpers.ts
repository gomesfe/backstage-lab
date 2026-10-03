import type { NotificationSeverity } from '@backstage/plugin-notifications-common';

export type Visao = 'naoLidas' | 'todas' | 'salvas';

/** Notificações por página do "Carregar mais". */
export const POR_PAGINA = 30;

export const ROTULO_SEVERIDADE: Record<NotificationSeverity, string> = {
  critical: 'Crítica',
  high: 'Alta',
  normal: 'Normal',
  low: 'Baixa',
};

export const SEVERIDADES = Object.keys(
  ROTULO_SEVERIDADE,
) as NotificationSeverity[];

/** Hoje · Ontem · Esta semana · Mais antigas. */
export function grupoDoDia(data: Date, agora: Date = new Date()): string {
  const hoje = new Date(agora);
  hoje.setHours(0, 0, 0, 0);
  const dia = new Date(data);
  dia.setHours(0, 0, 0, 0);
  const diferenca = Math.round((hoje.getTime() - dia.getTime()) / 86_400_000);
  if (diferenca <= 0) return 'Hoje';
  if (diferenca === 1) return 'Ontem';
  if (diferenca < 7) return 'Esta semana';
  return 'Mais antigas';
}

/** "há 5 min", "há 3 h", "ontem às 14:05", "12/09 às 09:30". */
export function quando(data: Date, agora: Date = new Date()): string {
  const minutos = Math.round((agora.getTime() - data.getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  if (minutos < 6 * 60) return `há ${Math.round(minutos / 60)} h`;
  const hora = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (grupoDoDia(data, agora) === 'Ontem') return `ontem às ${hora}`;
  return `${data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })} às ${hora}`;
}

export function ehExterno(link: string): boolean {
  return /^https?:\/\//i.test(link);
}
