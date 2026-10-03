import { useCallback, useMemo, useState } from 'react';
import { SKILLS } from '../data';
import type { Skill } from '../types';

type Resultado = {
  skills: Skill[];
  loading: boolean;
  /** "Atualizar": busca as skills de novo no repositório. */
  refresh: () => void;
};

/**
 * Skills do repositório nuclea-ia-skills. Hoje vêm de `data.ts`. Com o dado
 * real, troque o corpo por `useApi(...)` + `useAsync` lendo as três branches,
 * mantendo o mesmo retorno.
 */
export function useSkills(): Resultado {
  const [versao, setVersao] = useState(0);
  const refresh = useCallback(() => setVersao(atual => atual + 1), []);

  return useMemo(
    () => ({ skills: SKILLS, loading: false, refresh }),
    // `versao` força recalcular depois do refresh quando houver API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refresh, versao],
  );
}
