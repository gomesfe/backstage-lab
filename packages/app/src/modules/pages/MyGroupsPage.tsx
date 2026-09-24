import useAsync from 'react-use/lib/useAsync';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { identityApiRef } from '@backstage/core-plugin-api';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import PeopleIcon from '@material-ui/icons/People';
import GroupIcon from '@material-ui/icons/Group';
import ArrowIcon from '@material-ui/icons/CallMade';
import {
  AtlasPage,
  Badge,
  CardGrid,
  FeatureCard,
} from '@internal/plugin-components';

/**
 * Grupos aos quais o usuário pertence.
 *
 * No redesign a lista é fixa em `GROUP_OPTIONS`. Aqui ela vem da identidade:
 * `ownershipEntityRefs` é exatamente "de que grupos este usuário faz parte",
 * que é a pergunta da tela.
 */
export function MyGroupsPage() {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const navigate = useNavigate();

  const { value, loading, error } = useAsync(async () => {
    const identity = await identityApi.getBackstageIdentity();
    const refs = identity.ownershipEntityRefs.filter(ref =>
      ref.startsWith('group:'),
    );

    if (refs.length === 0) return { groups: [], counts: {} as Record<string, number> };

    const { items: groups } = await catalogApi.getEntitiesByRefs({
      entityRefs: refs,
    });

    // Quantos componentes cada grupo possui — o "serviços" do card.
    const { items: owned } = await catalogApi.getEntities({
      filter: { kind: ['Component', 'Resource', 'API'] },
      fields: ['spec.owner'],
    });

    const counts: Record<string, number> = {};
    for (const entity of owned) {
      const owner = String((entity.spec as { owner?: string })?.owner ?? '');
      if (owner) counts[owner.toLowerCase()] = (counts[owner.toLowerCase()] ?? 0) + 1;
    }

    return {
      groups: groups.filter(Boolean),
      counts,
    };
  }, [catalogApi, identityApi]);

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  const groups = value?.groups ?? [];

  return (
    <AtlasPage
      eyebrow="Organização"
      title="Meus grupos"
      subtitle="Os grupos e squads dos quais você faz parte, com seus recursos e papéis."
    >
      {groups.length === 0 ? (
        <FeatureCard
          title="Você não pertence a nenhum grupo"
          body="Grupos vêm do catálogo. Adicione seu usuário a um Group no examples/org.yaml — sem isso o RBAC também não encontra suas permissões."
        />
      ) : (
        <CardGrid>
          {groups.map(group => {
            const ref = `group:default/${group!.metadata.name}`;
            const services = value?.counts[ref] ?? 0;
            const members =
              (group!.relations ?? []).filter(r => r.type === 'hasMember')
                .length;

            return (
              <FeatureCard
                key={group!.metadata.name}
                title={
                  <>
                    <GroupIcon
                      style={{ fontSize: 16, color: 'var(--lime)' }}
                    />
                    {group!.metadata.title ?? group!.metadata.name}
                  </>
                }
                badge={<Badge variant="lime">Membro</Badge>}
                body={group!.metadata.description}
                footer={
                  <>
                    <span>
                      <PeopleIcon style={{ fontSize: 13, verticalAlign: -2 }} />{' '}
                      {members} membro(s)
                    </span>
                    <span>{services} recurso(s)</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        color: 'var(--lime)',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/catalog/default/group/${group!.metadata.name}`)}
                      onKeyDown={e =>
                        e.key === 'Enter' &&
                        navigate(`/catalog/default/group/${group!.metadata.name}`)
                      }
                    >
                      Abrir <ArrowIcon style={{ fontSize: 13, verticalAlign: -2 }} />
                    </span>
                  </>
                }
              />
            );
          })}
        </CardGrid>
      )}
    </AtlasPage>
  );
}
