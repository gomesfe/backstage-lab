import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  parseEntityRef,
  stringifyEntityRef,
  type Entity,
} from '@backstage/catalog-model';

export type Relacionadas = {
  /** APIs que a aplicação fornece. */
  apis: Entity[];
  /** Quem fornece a API. */
  fornecedores: Entity[];
  /** Outras entidades do mesmo sistema (ou as do sistema, quando é um sistema). */
  doSistema: Entity[];
  membros: Entity[];
  mantidos: Entity[];
};

const NENHUMA: Relacionadas = {
  apis: [],
  fornecedores: [],
  doSistema: [],
  membros: [],
  mantidos: [],
};

function refsDa(entidade: Entity, tipo: string): string[] {
  return (entidade.relations ?? [])
    .filter(relacao => relacao.type === tipo)
    .map(relacao => relacao.targetRef);
}

/**
 * A entidade do endereço (`#<kind>-<nome>`, nome sem diferença de
 * maiúsculas) e as que se relacionam com ela, pelo `catalogApi`.
 */
export function useEntidade(kind: string, nome: string) {
  const catalogApi = useApi(catalogApiRef);

  return useAsync(async (): Promise<{
    entidade?: Entity;
    relacionadas: Relacionadas;
  }> => {
    if (!kind || !nome) return { relacionadas: NENHUMA };
    const { items } = await catalogApi.getEntities({ filter: { kind } });
    const entidade = items.find(
      item =>
        item.metadata.name.toLowerCase() === nome &&
        (item.metadata.namespace ?? 'default') === 'default',
    );
    if (!entidade) return { relacionadas: NENHUMA };

    const buscar = async (refs: string[]) =>
      refs.length
        ? (
            await catalogApi.getEntitiesByRefs({ entityRefs: refs })
          ).items.filter((item): item is Entity => Boolean(item))
        : [];

    // Mesmo sistema: as partes do sistema, menos a própria entidade.
    const sistemaRef =
      kind === 'System'
        ? stringifyEntityRef(entidade)
        : refsDa(entidade, 'partOf')[0];
    let doSistema: Entity[] = [];
    if (sistemaRef) {
      const [sistema] = await buscar([sistemaRef]);
      const partes = sistema ? await buscar(refsDa(sistema, 'hasPart')) : [];
      doSistema = partes.filter(
        parte => stringifyEntityRef(parte) !== stringifyEntityRef(entidade),
      );
    }

    const [apis, fornecedores, membros, mantidos] = await Promise.all([
      buscar(refsDa(entidade, 'providesApi')),
      buscar(refsDa(entidade, 'apiProvidedBy')),
      buscar(refsDa(entidade, 'hasMember')),
      buscar(
        refsDa(entidade, 'ownerOf').filter(
          ref => parseEntityRef(ref).kind.toLowerCase() !== 'group',
        ),
      ),
    ]);

    return {
      entidade,
      relacionadas: { apis, fornecedores, doSistema, membros, mantidos },
    };
  }, [catalogApi, kind, nome]);
}
