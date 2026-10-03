import { useMemo } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { paraOferta } from '../helpers';

/** Ofertas = entidades `kind: Template` do catálogo. */
export function useOfertas() {
  const catalogApi = useApi(catalogApiRef);
  const { value, loading, error } = useAsync(
    async () =>
      (await catalogApi.getEntities({ filter: { kind: 'Template' } })).items,
    [catalogApi],
  );
  const ofertas = useMemo(() => (value ?? []).map(paraOferta), [value]);
  return { ofertas, loading, error };
}
