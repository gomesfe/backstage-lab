/** Ambientes das skills: são as branches do repositório nuclea-ia-skills. */
export type AmbienteSkill = 'release' | 'hml' | 'dev';

export type Skill = {
  /** Nome da pasta em `skills/` (kebab-case). */
  slug: string;
  nome: string;
  descricao: string;
  /** Em quais branches a skill existe. */
  ambientes: AmbienteSkill[];
  autor: string;
  /** "dd/mm/aaaa, hh:mm" — último commit. */
  atualizadoEm: string;
};

export type FiltroAmbiente = AmbienteSkill | 'todos';

export type Dialogo = 'ajuda' | 'cadastrar';
