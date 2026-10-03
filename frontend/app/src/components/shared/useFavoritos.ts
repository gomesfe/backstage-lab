import { useCallback, useMemo } from 'react';
import useObservable from 'react-use/lib/useObservable';
import { storageApiRef, useApi } from '@backstage/core-plugin-api';

const CHAVE = 'favoritos';

/**
 * Favoritos de cada pessoa numa lista (Docs, Catálogo, APIs), pela
 * `storageApi` do Backstage. Enquanto a pessoa não mexer, valem os `padrao`.
 *
 * Hoje grava no navegador; com o backend de user-settings passa a seguir o
 * usuário entre dispositivos sem mudar nada aqui.
 */
export function useFavoritos(lista: string, padrao: string[]) {
  const bucket = useApi(storageApiRef).forBucket(`atlas-${lista}`);
  const snapshot = useObservable(bucket.observe$<string[]>(CHAVE), bucket.snapshot<string[]>(CHAVE));
  const favoritos = useMemo(() => new Set(snapshot?.value ?? padrao), [snapshot, padrao]);

  const alternar = useCallback(
    (id: string) => {
      const proximo = new Set(favoritos);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      bucket.set(CHAVE, [...proximo]);
    },
    [bucket, favoritos],
  );

  return { favoritos, alternar };
}
