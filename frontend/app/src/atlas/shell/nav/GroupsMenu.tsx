import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupIcon from '@material-ui/icons/PeopleOutline';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';

type Group = { ref: string; name: string; title: string };

/** Grupos de quem está logado: as refs `group:` da identidade, com o título do catálogo quando houver. */
function useMyGroups(open: boolean) {
  const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);
  const [groups, setGroups] = useState<Group[] | undefined>(undefined);

  useEffect(() => {
    if (!open || groups) return undefined;
    let active = true;
    (async () => {
      const { ownershipEntityRefs } = await identityApi.getBackstageIdentity();
      const refs = ownershipEntityRefs.filter(ref => ref.startsWith('group:'));
      let titles: Record<string, string> = {};
      try {
        const { items } = await catalogApi.getEntitiesByRefs({ entityRefs: refs, fields: ['kind', 'metadata', 'spec.profile'] });
        titles = Object.fromEntries(
          items.flatMap((entity, i) => {
            if (!entity) return [];
            const profile = (entity.spec as { profile?: { displayName?: string } } | undefined)?.profile;
            return [[refs[i], profile?.displayName ?? entity.metadata.title ?? entity.metadata.name]];
          }),
        );
      } catch {
        // sem catálogo, ficam os nomes das refs
      }
      if (active) {
        setGroups(refs.map(ref => ({ ref, name: parseEntityRef(ref).name, title: titles[ref] ?? parseEntityRef(ref).name })));
      }
    })().catch(() => active && setGroups([]));
    return () => {
      active = false;
    };
  }, [open, groups, identityApi, catalogApi]);

  return groups;
}

/**
 * Botão "Meus grupos" da barra (ao lado do Toolkit): mostra os grupos de
 * quem está logado e leva à página completa. Substitui a pílula do menu.
 */
export function GroupsMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const groups = useMyGroups(open);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div ref={wrapperRef} className="atlas-navDropdownWrapper">
      <button
        ref={buttonRef}
        type="button"
        className="atlas-navActionBtn"
        aria-label="Meus grupos"
        title="Meus grupos"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="atlas-groups-menu"
        onClick={() => setOpen(value => !value)}
      >
        <GroupIcon fontSize="small" />
      </button>

      {open && (
        <div
          id="atlas-groups-menu"
          className="atlas-navDropdownMenu"
          role="menu"
          aria-label="Meus grupos"
          style={{ width: 'min(300px, calc(100vw - 32px))', padding: '8px 0 10px' }}
        >
          <div className="atlas-dropdownHeader">Meus grupos</div>
          <div className="atlas-groupsMenuList">
            {groups === undefined && <span className="atlas-groupsMenuEmpty">Carregando…</span>}
            {groups?.length === 0 && <span className="atlas-groupsMenuEmpty">Você não está em nenhum grupo.</span>}
            {groups?.map(group => (
              <button key={group.ref} type="button" role="menuitem" className="atlas-groupsMenuItem" onClick={() => go(`/my-groups#${group.name}`)}>
                <span className="atlas-avatar" aria-hidden="true">
                  {group.title.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <span className="atlas-groupsMenuName">{group.title}</span>
                  <span className="atlas-groupsMenuRef">{group.ref}</span>
                </span>
              </button>
            ))}
          </div>
          <button type="button" role="menuitem" className="atlas-groupsMenuAll" onClick={() => go('/my-groups')}>
            Ver todos os meus grupos →
          </button>
        </div>
      )}
    </div>
  );
}
