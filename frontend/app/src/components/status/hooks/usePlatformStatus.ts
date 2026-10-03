import { STATUS } from '../data';
import type { StatusPlataforma } from '../types';

type Resultado = { status: StatusPlataforma; loading: boolean };

/**
 * Saúde da plataforma. Hoje vem de `data.ts`. Com dado real, troque por
 * `useApi(fetchApiRef)` + `useAsync` lendo `/.backstage/health/v1/readiness`
 * e a prontidão de cada plugin, mantendo o mesmo retorno.
 */
export function usePlatformStatus(): Resultado {
  return { status: STATUS, loading: false };
}
