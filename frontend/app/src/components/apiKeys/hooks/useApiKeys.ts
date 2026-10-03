import { useCallback, useMemo } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { ApiKeysClient } from '../api';

/**
 * Chaves de API de quem está vendo (ou de todos, para quem tem
 * `api-key.read.all`), pelo backend `api-keys`.
 */
export function useApiKeys() {
  const discovery = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const cliente = useMemo(
    () => new ApiKeysClient(discovery, fetchApi),
    [discovery, fetchApi],
  );
  const { value, loading, error, retry } = useAsyncRetry(
    () => cliente.listar(),
    [cliente],
  );

  const revogar = useCallback(
    async (id: string) => {
      try {
        await cliente.revogar(id);
      } finally {
        retry();
      }
    },
    [cliente, retry],
  );

  return {
    chaves: value ?? [],
    loading,
    error,
    recarregar: retry,
    criar: cliente.criar.bind(cliente),
    revogar,
  };
}
