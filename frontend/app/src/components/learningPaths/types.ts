/** Um bloco do texto que abre no pop-up da etapa. */
export type Bloco = {
  titulo: string;
  paragrafos?: string[];
  itens?: string[];
};

export type Etapa = {
  id: string;
  titulo: string;
  /** Resumo que aparece na lista de etapas. */
  resumo: string;
  /** Texto completo, aberto no pop-up. Sem ele o pop-up mostra só o resumo. */
  conteudo?: Bloco[];
};

export type Dificuldade = 'Iniciante' | 'Intermediário' | 'Avançado';

export type Trilha = {
  id: string;
  titulo: string;
  descricao: string;
  dificuldade: Dificuldade;
  temas: string[];
  etapas: Etapa[];
};

/** Trilha → ids das etapas que a pessoa concluiu. */
export type Progresso = Record<string, string[]>;

export type Filtros = { busca: string; dificuldade: string; tema: string };
