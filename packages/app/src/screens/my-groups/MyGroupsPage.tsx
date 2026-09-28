import useAsync from 'react-use/lib/useAsync';
import { Link as RouterLink } from 'react-router-dom';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { ResponseErrorPanel } from '@backstage/core-components';
import PeopleIcon from '@material-ui/icons/People';
import CloudIcon from '@material-ui/icons/CloudQueue';
import {
  AtlasPage,
  Badge,
  CardGrid,
  FeatureCard,
} from '@internal/plugin-components';

type GroupCard = {
  ref: string;
  name: string;
  title: string;
  description?: string;
  type?: string;
  members: number;
  owned: number;
};

/**
 * Grupos aos quais o usuário pertence. O que a tela deve conter está em
 * `README.md`.
 *
 * A lista vem da identidade: `ownershipEntityRefs` é exatamente "de que
 * grupos este usuário faz parte", que é a pergunta da tela.
 */
export function MyGroupsPage() {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);

  const { value, loading, error } = useAsync(async (): Promise<GroupCard[]> => {
    const identity = await identityApi.getBackstageIdentity();
    const refs = identity.ownershipEntityRefs.filter(ref => ref.startsWith('group:'));
    if (refs.length === 0) return [];

    const { items: groups } = await catalogApi.getEntitiesByRefs({ entityRefs: refs });
    const { items: owned } = await catalogApi.getEntities({
      filter: { kind: ['Component', 'Resource', 'API', 'System'] },
      fields: ['spec.owner'],
    });

    // `spec.owner` pode vir como "payments", "group:payments" ou
    // "group:default/payments". Normalizar para a ref completa antes de
    // comparar — sem isso a contagem dava zero para quase todo grupo.
    const counts: Record<string, number> = {};
    for (const entity of owned) {
      const raw = (entity.spec as { owner?: string })?.owner;
      if (!raw) continue;
      const ref = stringifyEntityRef(
        parseEntityRef(raw, { defaultKind: 'group', defaultNamespace: 'default' }),
      );
      counts[ref] = (counts[ref] ?? 0) + 1;
    }

    return groups.filter(Boolean).map(group => {
      const ref = stringifyEntityRef(group!);
      return {
        ref,
        name: group!.metadata.name,
        title: group!.metadata.title ?? group!.metadata.name,
        description: group!.metadata.description,
        type: (group!.spec as { type?: string })?.type,
        members: (group!.relations ?? []).filter(r => r.type === 'hasMember').length,
        owned: counts[ref] ?? 0,
      };
    });
  }, [catalogApi, identityApi]);

  if (error) return <ResponseErrorPanel error={error} />;

  const groups = value ?? [];

  return (
    <AtlasPage
      eyebrow="Organização"
      title="Meus grupos"
      subtitle="Os grupos e squads dos quais você faz parte, e o que cada um mantém no catálogo."
    >
      {loading ? (
        <CardGrid>
          {Array.from({ length: 3 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <article key={index} className="atlas-featureCard" aria-hidden>
              <div className="atlas-skeletonLine" style={{ width: '40%' }} />
              <div className="atlas-skeletonLine" style={{ width: '80%' }} />
              <div className="atlas-skeletonLine" style={{ width: '60%' }} />
            </article>
          ))}
        </CardGrid>
      ) : groups.length === 0 ? (
        <section className="atlas-sectionCard">
          <div className="atlas-emptyState">
            <strong style={{ color: 'var(--text-primary)' }}>Você ainda não está em nenhum grupo.</strong>
            <br />
            Grupos vêm do catálogo: adicione seu usuário a um <code className="atlas-costMono">Group</code> em{' '}
            <code className="atlas-costMono">examples/org.yaml</code>. Sem grupo, o RBAC também não
            encontra suas permissões.
          </div>
        </section>
      ) : (
        <CardGrid>
          {groups.map(group => (
            <FeatureCard
              key={group.ref}
              title={group.title}
              badge={
                <span style={{ display: 'flex', gap: 6 }}>
                  <Badge variant="lime">membro</Badge>
                  {group.type && <Badge variant="info">{group.type}</Badge>}
                </span>
              }
              body={group.description ?? 'Sem descrição no catálogo.'}
              footer={
                <>
                  <span className="atlas-tagChip" title="Membros">
                    <PeopleIcon style={{ fontSize: 12, verticalAlign: -2 }} /> {group.members}
                  </span>
                  <span className="atlas-tagChip" title="Itens no catálogo">
                    <CloudIcon style={{ fontSize: 12, verticalAlign: -2 }} /> {group.owned}
                  </span>
                  <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    <RouterLink className="atlas-btnPill" to={`/catalog?owner=${encodeURIComponent(group.name)}`}>
                      Ver itens
                    </RouterLink>
                    <RouterLink className="atlas-btnPill atlas-btnPillLime" to={`/catalog/default/group/${group.name}`}>
                      Abrir
                    </RouterLink>
                  </span>
                </>
              }
            />
          ))}
        </CardGrid>
      )}
    </AtlasPage>
  );
}
