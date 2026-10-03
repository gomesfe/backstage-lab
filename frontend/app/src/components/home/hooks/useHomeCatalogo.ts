import { useMemo } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { NAMESPACE_INTERNO, paraEntidade } from '../../catalog/helpers';
import type { Entidade } from '../../catalog/types';

export type AplicacaoDoTime = Entidade & {
  repositorio?: string;
  sonar?: string;
};

/**
 * O que a Home lê do catálogo: os números (aplicações, squads, APIs,
 * sistemas) e as aplicações de cada time, com os links de repositório e
 * Sonar das anotações.
 */
export function useHomeCatalogo() {
  const catalogApi = useApi(catalogApiRef);

  const { value, loading, error } = useAsync(async () => {
    const { items } = await catalogApi.getEntities({
      filter: { kind: ['Component', 'API', 'System', 'Group'] },
    });
    return items.filter(
      entidade =>
        (entidade.metadata.namespace ?? 'default') !== NAMESPACE_INTERNO,
    );
  }, [catalogApi]);

  return useMemo(() => {
    const entidades = value ?? [];
    const doTipo = (tipo: string) =>
      entidades.filter(entidade => entidade.kind === tipo);
    const emProducao = (lista: typeof entidades) =>
      lista.filter(
        entidade =>
          (entidade.spec as { lifecycle?: string })?.lifecycle === 'production',
      ).length;
    const componentes = doTipo('Component');

    const aplicacoes: AplicacaoDoTime[] = componentes.map(entidade => ({
      ...paraEntidade(entidade),
      repositorio: entidade.metadata.annotations?.['github.com/project-slug'],
      sonar: entidade.metadata.annotations?.['sonarqube.org/project-key'],
    }));

    return {
      loading,
      error,
      numeros: {
        aplicacoes: componentes.length,
        aplicacoesEmProducao: emProducao(componentes),
        squads: doTipo('Group').filter(
          grupo => (grupo.spec as { type?: string })?.type === 'team',
        ).length,
        apis: doTipo('API').length,
        apisEmProducao: emProducao(doTipo('API')),
        sistemas: doTipo('System').length,
        aplicacoesEmSistemas: componentes.filter(
          entidade => (entidade.spec as { system?: string })?.system,
        ).length,
      },
      aplicacoes,
    };
  }, [value, loading, error]);
}
