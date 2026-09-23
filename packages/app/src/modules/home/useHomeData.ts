import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import type { Entity } from '@backstage/catalog-model';

export type Metric = {
  title: string;
  value: string;
  highlighted?: boolean;
};

export type ServiceRow = {
  name: string;
  owner: string;
  kind: string;
  lifecycle: string;
};

/**
 * Dados da Home vindos do catálogo.
 *
 * No redesign esses números são fixos em `data.ts`. Aqui eles são contados de
 * verdade — uma Home que mostra "48 squads" quando o catálogo tem 3 ensina o
 * time a não confiar no portal, que é o oposto do que ele serve.
 *
 * Uma única consulta traz o que as seções precisam: contar no cliente evita
 * seis chamadas para seis números.
 */
export function useHomeData(scope: string) {
  const catalogApi = useApi(catalogApiRef);

  const { value, loading, error } = useAsync(async () => {
    const { items } = await catalogApi.getEntities({
      filter: [
        { kind: ['Component', 'System', 'Resource', 'API'] },
        { kind: ['Group'] },
      ],
      fields: [
        'kind',
        'metadata.name',
        'metadata.title',
        'spec.type',
        'spec.lifecycle',
        'spec.owner',
        'relations',
      ],
    });
    return items;
  }, [catalogApi]);

  const entities: Entity[] = value ?? [];

  const ofKind = (kind: string) =>
    entities.filter(e => e.kind.toLowerCase() === kind.toLowerCase());

  const groups = ofKind('Group');
  const components = ofKind('Component');
  const resources = ofKind('Resource');

  const inScope = (entity: Entity) => {
    if (scope === 'Todos') return true;
    const owner = String((entity.spec as { owner?: string })?.owner ?? '');
    return owner.toLowerCase().includes(scope.toLowerCase());
  };

  const scopedComponents = components.filter(inScope);

  const metrics: Metric[] = [
    { title: 'Serviço Núclea', value: scope },
    {
      title: 'Squads no escopo',
      value: String(
        groups.filter(g => (g.spec as { type?: string })?.type !== 'tribo')
          .length,
      ),
    },
    { title: 'Aplicações', value: String(scopedComponents.length) },
    { title: 'Recursos provisionados', value: String(resources.length) },
    { title: 'APIs', value: String(ofKind('API').length) },
    {
      title: 'Sistemas',
      value: String(ofKind('System').length),
      highlighted: true,
    },
  ];

  const services: ServiceRow[] = scopedComponents.slice(0, 6).map(entity => {
    const spec = entity.spec as {
      type?: string;
      lifecycle?: string;
      owner?: string;
    };
    return {
      name: entity.metadata.title ?? entity.metadata.name,
      owner: String(spec?.owner ?? '—').replace(/^group:default\//, ''),
      kind: spec?.type ?? 'component',
      lifecycle: spec?.lifecycle ?? '—',
    };
  });

  return { metrics, services, loading, error };
}
