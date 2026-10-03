import { useCallback, useMemo } from 'react';
import useObservable from 'react-use/lib/useObservable';
import { storageApiRef, useApi } from '@backstage/core-plugin-api';
import type { Progresso } from '../types';

const CHAVE = 'progress';

/**
 * Progresso de cada pessoa nas trilhas, pela `storageApi` do Backstage.
 *
 * Hoje ela grava no navegador; se o portal ganhar o backend de
 * user-settings, passa a acompanhar o usuário entre dispositivos sem mudar
 * nada aqui.
 */
export function useProgresso() {
  const bucket = useApi(storageApiRef).forBucket('atlas-learning-paths');
  const snapshot = useObservable(
    bucket.observe$<Progresso>(CHAVE),
    bucket.snapshot<Progresso>(CHAVE),
  );
  const progresso: Progresso = useMemo(() => snapshot?.value ?? {}, [snapshot]);

  const feitasEm = useCallback(
    (trilhaId: string) => new Set(progresso[trilhaId] ?? []),
    [progresso],
  );

  const definir = useCallback(
    (trilhaId: string, etapaId: string, feita: boolean) => {
      const feitas = new Set(progresso[trilhaId] ?? []);
      if (feita) feitas.add(etapaId);
      else feitas.delete(etapaId);
      bucket.set(CHAVE, { ...progresso, [trilhaId]: [...feitas] });
    },
    [bucket, progresso],
  );

  const recomecar = useCallback(
    (trilhaId: string) => {
      const proximo = { ...progresso };
      delete proximo[trilhaId];
      bucket.set(CHAVE, proximo);
    },
    [bucket, progresso],
  );

  return { feitasEm, definir, recomecar };
}
