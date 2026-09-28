import { useCallback, useMemo } from 'react';
import useObservable from 'react-use/lib/useObservable';
import { useApi, storageApiRef } from '@backstage/core-plugin-api';

type Progress = Record<string, string[]>; // trilha → ids das etapas concluídas

const KEY = 'progress';

/**
 * Progresso de cada pessoa nas trilhas, pela `storageApi` do Backstage.
 *
 * Hoje ela grava no navegador; se o portal ganhar o backend de
 * user-settings, passa a acompanhar o usuário entre dispositivos sem mudar
 * nada aqui.
 */
export function useProgress() {
  const bucket = useApi(storageApiRef).forBucket('atlas-learning-paths');
  const snapshot = useObservable(bucket.observe$<Progress>(KEY), bucket.snapshot<Progress>(KEY));
  const progress: Progress = useMemo(() => snapshot?.value ?? {}, [snapshot]);

  const doneIn = useCallback((pathId: string) => new Set(progress[pathId] ?? []), [progress]);

  const toggle = useCallback(
    (pathId: string, stepId: string) => {
      const done = new Set(progress[pathId] ?? []);
      if (done.has(stepId)) done.delete(stepId);
      else done.add(stepId);
      bucket.set(KEY, { ...progress, [pathId]: [...done] });
    },
    [bucket, progress],
  );

  const reset = useCallback(
    (pathId: string) => {
      const next = { ...progress };
      delete next[pathId];
      bucket.set(KEY, next);
    },
    [bucket, progress],
  );

  return { doneIn, toggle, reset };
}
