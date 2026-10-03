import { contem } from '../shared/filtros';
import type { Dificuldade, Filtros, Trilha } from './types';

export const DIFICULDADES: Dificuldade[] = ['Iniciante', 'Intermediário', 'Avançado'];

/** Cor do selo da dificuldade. */
export const TOM_DIFICULDADE: Record<Dificuldade, 'lime' | 'info' | 'purple'> = {
  Iniciante: 'lime',
  Intermediário: 'info',
  Avançado: 'purple',
};

export function filtrarTrilhas(trilhas: Trilha[], filtros: Filtros): Trilha[] {
  return trilhas.filter(
    trilha =>
      (!filtros.busca.trim() || contem(`${trilha.titulo} ${trilha.descricao} ${trilha.temas.join(' ')}`, filtros.busca)) &&
      (!filtros.dificuldade || trilha.dificuldade === filtros.dificuldade) &&
      (!filtros.tema || trilha.temas.includes(filtros.tema)),
  );
}

/** Quantas etapas da trilha a pessoa concluiu (ignora ids que não existem mais). */
export function contarFeitas(trilha: Trilha, feitas: Set<string>): number {
  return trilha.etapas.filter(etapa => feitas.has(etapa.id)).length;
}

/** Começar / Continuar / Revisar, conforme o progresso. */
export function acaoDaTrilha(feitas: number, total: number): 'Começar' | 'Continuar' | 'Revisar' {
  if (feitas === 0) return 'Começar';
  return feitas >= total ? 'Revisar' : 'Continuar';
}

/** A próxima trilha da lista (para sugerir ao concluir uma). */
export function proximaTrilha(trilhas: Trilha[], atual: Trilha): Trilha | undefined {
  const indice = trilhas.findIndex(trilha => trilha.id === atual.id);
  return trilhas[indice + 1] ?? trilhas.find(trilha => trilha.id !== atual.id);
}
