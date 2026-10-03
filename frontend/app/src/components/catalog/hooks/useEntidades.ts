import { useMemo } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { NAMESPACE_INTERNO, paraEntidade } from '../helpers';
import type { Entidade } from '../types';

type Opcoes = {
  /** Só o que publica documentação (anotação `backstage.io/techdocs-ref`). */
  soComDocs?: boolean;
  /** Os itens internos do time do Atlas em vez do catálogo dos squads. */
  interno?: boolean;
};

/**
 * Entidades do catálogo dos tipos pedidos, pelo `catalogApi` — com as
 * permissões de quem está vendo. Os itens internos do Atlas (namespace
 * `atlas`) ficam fora, a não ser que `interno` seja pedido.
 */
export function useEntidades(
  kinds: string[],
  { soComDocs = false, interno = false }: Opcoes = {},
) {
  const catalogApi = useApi(catalogApiRef);
  const chave = kinds.join(',');

  const { value, loading, error } = useAsync(async () => {
    const { items } = await catalogApi.getEntities({
      filter: { kind: chave.split(',') },
    });
    return items;
  }, [catalogApi, chave]);

  const entidades: Entidade[] = useMemo(
    () =>
      (value ?? [])
        .map(paraEntidade)
        .filter(entidade =>
          interno
            ? entidade.namespace === NAMESPACE_INTERNO
            : entidade.namespace !== NAMESPACE_INTERNO,
        )
        .filter(entidade => !soComDocs || entidade.temDocs)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [value, soComDocs, interno],
  );

  return { entidades, loading, error };
}
