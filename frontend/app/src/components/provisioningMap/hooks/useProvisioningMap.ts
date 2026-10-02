import { useCallback, useMemo, useState } from 'react';
import { INTERNOS, RECURSOS, REPOSITORIOS, SERVICOS } from '../data';
import type { ItemInterno, Recurso, Repositorio } from '../types';

type Resultado = {
  recursos: Recurso[];
  repositorios: Repositorio[];
  internos: ItemInterno[];
  servicos: Record<string, string>;
  loading: boolean;
  /** "Refresh admin": relê o inventário. */
  refresh: () => void;
};

/**
 * Dados do mapa. Hoje vêm de `data.ts` (os mesmos exemplos da tela HTML).
 * Com o inventário real, troque o corpo por uma chamada à API (ex.:
 * `useApi(provisioningApiRef)` + `useAsync`) mantendo o mesmo retorno.
 */
export function useProvisioningMap(): Resultado {
  const [versao, setVersao] = useState(0);
  const refresh = useCallback(() => setVersao(atual => atual + 1), []);

  return useMemo(
    () => ({
      recursos: RECURSOS,
      repositorios: REPOSITORIOS,
      internos: INTERNOS,
      servicos: SERVICOS,
      loading: false,
      refresh,
    }),
    // `versao` força recalcular depois do refresh quando houver API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refresh, versao],
  );
}
