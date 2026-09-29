import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import type { Entity } from '@backstage/catalog-model';

export type MetricId = 'components' | 'apis' | 'systems' | 'squads' | 'resources';

export type Metric = {
  id: MetricId;
  title: string;
  value: number;
  /** Linha de contexto abaixo do número — sempre derivada do catálogo. */
  sub: string;
  /** Para onde o cartão leva. */
  to: string;
  highlighted?: boolean;
};

export type ServiceRow = {
  id: string;
  name: string;
  owner: string;
  type: string;
  lifecycle: string;
  path: string;
};

export type WorkloadType = 'microservice' | 'static-site' | 'serverless';

export type ApplicationRow = {
  id: string;
  name: string;
  workloadType: WorkloadType | null;
  /** `spec.type` cru, mostrado quando não cai em nenhum dos três tipos. */
  rawType: string;
  path: string;
  /** Link do repositório, das anotações da entidade. `null` sem anotação. */
  repoUrl: string | null;
  /** Chave do projeto no SonarQube. `null` quando não há análise. */
  sonarKey: string | null;
};

/** `spec.type` do catálogo → tipo de workload mostrado na Home. */
const WORKLOAD_BY_SPEC_TYPE: Record<string, WorkloadType> = {
  service: 'microservice',
  microservice: 'microservice',
  website: 'static-site',
  'static-site': 'static-site',
  serverless: 'serverless',
  lambda: 'serverless',
  function: 'serverless',
  'funcao-lambda': 'serverless',
};

/**
 * Repositório a partir das anotações: `github.com/project-slug` primeiro,
 * depois `backstage.io/source-location` (`url:https://...`).
 */
function repoUrlOf(entity: Entity): string | null {
  const annotations = entity.metadata.annotations ?? {};
  const slug = annotations['github.com/project-slug'];
  if (slug) return `https://github.com/${slug}`;
  const source = annotations['backstage.io/source-location'];
  if (source?.startsWith('url:')) return source.slice('url:'.length);
  return null;
}

const ownerName = (entity: Entity) =>
  String((entity.spec as { owner?: string })?.owner ?? '')
    .replace(/^group:(default\/)?/, '')
    .toLowerCase();

const lifecycleOf = (entity: Entity) =>
  String((entity.spec as { lifecycle?: string })?.lifecycle ?? '');

/** "9 em produção · 3 experimentais", só com o que existe. */
function lifecycleSummary(entities: Entity[]): string {
  const production = entities.filter(e => lifecycleOf(e) === 'production').length;
  const experimental = entities.filter(e => lifecycleOf(e) === 'experimental').length;
  const deprecated = entities.filter(e => lifecycleOf(e) === 'deprecated').length;
  const parts = [
    production && `${production} em produção`,
    experimental && `${experimental} experimenta${experimental > 1 ? 'is' : 'l'}`,
    deprecated && `${deprecated} descontinuad${deprecated > 1 ? 'os' : 'o'}`,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'sem ciclo de vida definido';
}

/**
 * Dados da Home, todos contados do catálogo.
 *
 * No redesign esses números eram fixos. Aqui são reais — uma Home que mostra
 * "48 squads" quando o catálogo tem 3 ensina o time a não confiar no portal.
 *
 * O escopo filtra tudo pelo dono: aplicações, APIs, recursos e sistemas do
 * squad escolhido. Uma consulta só; contar no cliente evita uma chamada por
 * número.
 */
export function useHomeData(scope: string) {
  const catalogApi = useApi(catalogApiRef);

  const { value, loading, error } = useAsync(async () => {
    const { items } = await catalogApi.getEntities({
      filter: { kind: ['Component', 'System', 'Resource', 'API', 'Group'] },
      fields: [
        'kind',
        'metadata.name',
        'metadata.namespace',
        'metadata.title',
        'metadata.annotations',
        'spec.type',
        'spec.lifecycle',
        'spec.owner',
        'spec.system',
      ],
    });
    return items;
  }, [catalogApi]);

  const all: Entity[] = value ?? [];
  const inScope = (entity: Entity) =>
    scope === 'Todos' || ownerName(entity).includes(scope.toLowerCase());
  const ofKind = (kind: string) =>
    all.filter(e => e.kind === kind && inScope(e));

  const components = ofKind('Component');
  const apis = ofKind('API');
  const systems = ofKind('System');
  const resources = ofKind('Resource');
  const squads = all.filter(
    e =>
      e.kind === 'Group' &&
      (scope === 'Todos' ||
        e.metadata.name.toLowerCase().includes(scope.toLowerCase())),
  );
  const linkedToSystem = components.filter(
    e => (e.spec as { system?: string })?.system,
  ).length;

  const metrics: Metric[] = [
    {
      id: 'components',
      title: 'Aplicações',
      value: components.length,
      sub: lifecycleSummary(components),
      to: '/catalog?kind=Component',
    },
    {
      id: 'apis',
      title: 'APIs',
      value: apis.length,
      sub: lifecycleSummary(apis),
      to: '/api-docs',
    },
    {
      id: 'systems',
      title: 'Sistemas',
      value: systems.length,
      sub: `${linkedToSystem} aplicaç${linkedToSystem === 1 ? 'ão vinculada' : 'ões vinculadas'}`,
      to: '/catalog?kind=System',
    },
    {
      id: 'squads',
      title: 'Squads no escopo',
      value: squads.length,
      sub: 'grupos registrados no catálogo',
      to: '/catalog?kind=Group',
    },
    {
      id: 'resources',
      title: 'Recursos provisionados',
      value: resources.length,
      sub: resources.length
        ? 'bancos, filas e buckets criados pelas ofertas'
        : 'nenhum ainda — provisione o primeiro em Ofertas',
      to: '/catalog?kind=Resource',
      highlighted: true,
    },
  ];

  const services: ServiceRow[] = components.slice(0, 8).map(entity => {
    const spec = entity.spec as { type?: string; owner?: string };
    const namespace = entity.metadata.namespace ?? 'default';
    return {
      id: `${namespace}/${entity.metadata.name}`,
      name: entity.metadata.title ?? entity.metadata.name,
      owner: ownerName(entity) || '—',
      type: spec?.type ?? 'component',
      lifecycle: lifecycleOf(entity),
      path: `/catalog/${namespace}/component/${entity.metadata.name}`,
    };
  });

  const applications: ApplicationRow[] = components
    .map(entity => {
      const specType = String((entity.spec as { type?: string })?.type ?? '');
      const namespace = entity.metadata.namespace ?? 'default';
      return {
        id: `${namespace}/${entity.metadata.name}`,
        name: entity.metadata.title ?? entity.metadata.name,
        workloadType: WORKLOAD_BY_SPEC_TYPE[specType.toLowerCase()] ?? null,
        rawType: specType || 'component',
        path: `/catalog/${namespace}/component/${entity.metadata.name}`,
        repoUrl: repoUrlOf(entity),
        sonarKey: entity.metadata.annotations?.['sonarqube.org/project-key'] ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    metrics,
    services,
    applications,
    totalServices: components.length,
    loading,
    error,
  };
}
