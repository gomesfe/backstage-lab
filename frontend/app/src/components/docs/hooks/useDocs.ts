import { DOCUMENTOS } from '../data';
import type { Documento } from '../types';

type Resultado = { documentos: Documento[]; loading: boolean };

/**
 * O que publica documentação. Hoje vem de `data.ts`. Com o catálogo, troque
 * por `useApi(catalogApiRef)` + `useAsync` buscando as entidades com a
 * anotação `backstage.io/techdocs-ref`, mantendo o mesmo retorno.
 */
export function useDocs(): Resultado {
  return { documentos: DOCUMENTOS, loading: false };
}
