import { contem } from '../shared/filtros';
import type { AmbienteSkill, FiltroAmbiente, Skill } from './types';

export const REPOSITORIO = 'https://github.com/NucleaSA/nuclea-ia-skills';

/** Do mais estável para o menos estável. */
export const ORDEM_AMBIENTES: AmbienteSkill[] = ['release', 'hml', 'dev'];

export const ABAS_AMBIENTE: { id: FiltroAmbiente; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'release', rotulo: 'Release' },
  { id: 'hml', rotulo: 'Hml' },
  { id: 'dev', rotulo: 'Dev' },
];

/** O `SKILL.md` no GitHub, na versão mais estável que existir (release > hml > dev). */
export function linkDaSkill(skill: Skill): string {
  const branch =
    ORDEM_AMBIENTES.find(ambiente => skill.ambientes.includes(ambiente)) ??
    'dev';
  return `${REPOSITORIO}/blob/${branch}/skills/${skill.slug}/SKILL.md`;
}

export function filtrarSkills(
  skills: Skill[],
  ambiente: FiltroAmbiente,
  busca: string,
): Skill[] {
  return skills.filter(
    skill =>
      (ambiente === 'todos' || skill.ambientes.includes(ambiente)) &&
      (!busca.trim() ||
        contem(`${skill.nome} ${skill.descricao} ${skill.slug}`, busca)),
  );
}

/** "AC" para "Aws Cost Optimize": o ícone do cartão. */
export function iniciais(nome: string): string {
  const partes = nome.split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
}

/** Uma cor estável por skill, para o ícone. */
export function matizDoNome(nome: string): number {
  let soma = 0;
  for (const letra of nome) soma = (soma * 31 + letra.charCodeAt(0)) % 360;
  return soma;
}
