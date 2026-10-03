import useAsync from 'react-use/lib/useAsync';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';

export type Grupo = {
  ref: string;
  nome: string;
  titulo: string;
  descricao?: string;
  /** spec.type: team, squad, tribo… */
  tipo?: string;
  membros: number;
  /** Quantas entidades do catálogo o grupo mantém. */
  itens: number;
};

/**
 * Grupos de quem está vendo. A lista vem da identidade: `ownershipEntityRefs`
 * é exatamente "de que grupos este usuário faz parte".
 */
export function useMeusGrupos() {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);

  const { value, loading, error } = useAsync(async (): Promise<Grupo[]> => {
    const identidade = await identityApi.getBackstageIdentity();
    const refs = identidade.ownershipEntityRefs.filter(ref =>
      ref.startsWith('group:'),
    );
    if (refs.length === 0) return [];

    const { items: grupos } = await catalogApi.getEntitiesByRefs({
      entityRefs: refs,
    });
    const { items: mantidos } = await catalogApi.getEntities({
      filter: { kind: ['Component', 'Resource', 'API', 'System'] },
      fields: ['spec.owner'],
    });

    // `spec.owner` pode vir como "pagamentos", "group:pagamentos" ou
    // "group:default/pagamentos". Normalizar para a ref completa antes de
    // comparar — sem isso a contagem dava zero para quase todo grupo.
    const contagem: Record<string, number> = {};
    for (const entidade of mantidos) {
      const dono = (entidade.spec as { owner?: string })?.owner;
      if (!dono) continue;
      const ref = stringifyEntityRef(
        parseEntityRef(dono, {
          defaultKind: 'group',
          defaultNamespace: 'default',
        }),
      );
      contagem[ref] = (contagem[ref] ?? 0) + 1;
    }

    return grupos.flatMap(grupo => {
      if (!grupo) return [];
      const ref = stringifyEntityRef(grupo);
      return [
        {
          ref,
          nome: grupo.metadata.name,
          titulo: grupo.metadata.title ?? grupo.metadata.name,
          descricao: grupo.metadata.description,
          tipo: (grupo.spec as { type?: string })?.type,
          membros: (grupo.relations ?? []).filter(
            relacao => relacao.type === 'hasMember',
          ).length,
          itens: contagem[ref] ?? 0,
        },
      ];
    });
  }, [catalogApi, identityApi]);

  return { grupos: value ?? [], loading, error };
}
